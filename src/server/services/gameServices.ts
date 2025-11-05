import {PrismaClient} from "@prisma/client";
import { Chess } from "chess.js";
import {ChatMessage, GameState, Move, Player} from "@/app/types/game";

const prisma = new PrismaClient();

function mapUserToPlayer(user: any): Player | undefined {
    if (!user) return undefined;
    return {
        id: user.id,
        username: user.username,
        // convert null -> undefined to satisfy Player.displayUsername?: string
        displayUsername: user.displayUsername ?? undefined,
        name: user.name,
        image: user.image ?? undefined,
        elo: user.elo,
    };
}

export class GameService {
    /**
     * Récupère l'état complet d'une partie
     */
    static async getGameState(gameId: string): Promise<GameState | null> {
        const game = await prisma.game.findUnique({
            where: { id: gameId },
            include: {
                playerWhite: true,
                playerBlack: true,
                bot: true,
                moves: {
                    orderBy: { moveNumber: "asc" },
                },
                messages: {
                    orderBy: { sentAt: "asc" },
                },
            },
        });

        if (!game) return null;

        return {
            id: game.id,
            code: game.code,
            status: game.status as any,
            result: game.result || undefined,
            currentFen: game.currentFen,
            moves: game.moves as Move[],
            capturedPieces: game.capturedPieces as any,
            playerWhite: mapUserToPlayer(game.playerWhite),
            playerBlack: mapUserToPlayer(game.playerBlack),
            bot: game.bot || undefined,
            chatMessages: game.messages as any,
            timeMode: game.timeMode,
            timeLimit: game.timeLimit,
            whiteTimeLeft: game.whiteTimeLeft,
            blackTimeLeft: game.blackTimeLeft
        };
    }

    /**
     * Valide et applique un coup
     */
    static validateAndApplyMove(
        currentFen: string,
        move: Omit<Move, "fen" | "capturedPiece">
    ): { valid: boolean; newFen?: string; capturedPiece?: string } {
        const chess = new Chess(currentFen);

        try {
            const result = chess.move({
                from: move.from,
                to: move.to,
                promotion: move.promotion,
            });

            if (!result) {
                return { valid: false };
            }

            return {
                valid: true,
                newFen: chess.fen(),
                capturedPiece: result.captured,
            };
        } catch {
            return { valid: false };
        }
    }

    /**
     * Enregistre un coup dans la base de données
     */
    static async saveMove(gameId: string, move: Move): Promise<void> {
        const game = await prisma.game.findUnique({
            where: { id: gameId },
            select: { capturedPieces: true, currentFen: true },
        });
        if (!game) throw new Error("Game not found");

        const capturedPieces = game.capturedPieces as any;

        if (move.capturedPiece) {
            const chess = new Chess(game.currentFen);
            const color = chess.turn() === "w" ? "white" : "black";
            capturedPieces[color].push(move.capturedPiece);
        }

        await prisma.$transaction([
            prisma.move.create({
                data: {
                    gameId,
                    moveNumber: move.moveNumber,
                    from: move.from,
                    to: move.to,
                    promotion: move.promotion || null,
                    capturedPiece: move.capturedPiece || null,
                    fen: move.fen,
                },
            }),
            prisma.game.update({
                where: { id: gameId },
                data: {
                    currentFen: move.fen,
                    capturedPieces,
                },
            }),
        ]);
    }

    /**
     * Vérifie si la partie est terminée et retourne le résultat
     */
    static checkGameOver(fen: string): {
        isOver: boolean;
        result?: string;
    } {
        const chess = new Chess(fen);

        if (!chess.isGameOver()) {
            return { isOver: false };
        }

        const winner = chess.turn() === "w" ? "black" : "white";
        let result: string;

        if (chess.isCheckmate()) {
            result = winner === "white" ? "WHITE_WIN" : "BLACK_WIN";
        } else if (chess.isStalemate()) {
            result = "STALEMATE";
        } else if (chess.isThreefoldRepetition()) {
            result = "REPETITION";
        } else {
            result = "DRAW";
        }

        return { isOver: true, result };
    }

    /**
     * Termine une partie
     */
    static async finishGame(
        gameId: string,
        result: string
    ): Promise<void> {
        await prisma.game.update({
            where: { id: gameId },
            data: {
                status: "FINISHED",
                result: result as any,
                finishedAt: new Date(),
            },
        });

        await this.updateRatings(gameId, result);
    }

    private static async updateRatings(gameId: string, result: string) {
        const game = await prisma.game.findUnique({
            where: {id: gameId},
            select: {
                playerWhiteId: true,
                playerBlackId: true,
                botId: true,
            },
        });

        if (!game) return;

        // Helper pour choisir K en fonction de l'elo (valeurs usuelles)
        const chooseK = (elo: number) => {
            if (elo < 2100) return 40;
            if (elo > 2400) return 20;
            return 32;
        };

        // Si la partie implique un bot, on met à jour seulement l'utilisateur
        if (game.botId) {
            // trouver le bot et l'utilisateur
            const bot = await prisma.bot.findUnique({ where: { id: game.botId } });
            if (!bot) return;

            // déterminer quel joueur est humain
            const humanPlayerId = game.playerWhiteId ?? game.playerBlackId ?? null;
            if (!humanPlayerId) return;

            const human = await prisma.user.findUnique({ where: { id: humanPlayerId } });
            if (!human) return;

            const rHuman = human.elo ?? 400;
            const rBot = bot.elo ?? 400;

            // expected score for human
            const expectedHuman = 1 / (1 + Math.pow(10, (rBot - rHuman) / 400));

            let scoreHuman = 0.5;
            if (result === "WHITE_WIN") {
                // check if human was white
                scoreHuman = game.playerWhiteId === humanPlayerId ? 1 : 0;
            } else if (result === "BLACK_WIN") {
                scoreHuman = game.playerBlackId === humanPlayerId ? 1 : 0;
            } else {
                scoreHuman = 0.5;
            }

            const K = chooseK(rHuman);
            const newHuman = Math.round(rHuman + K * (scoreHuman - expectedHuman));

            await prisma.$transaction([
                prisma.user.update({ where: { id: human.id }, data: { elo: newHuman } }),
                prisma.ratingHistory.create({
                    data: {
                        userId: human.id,
                        oldElo: rHuman,
                        newElo: newHuman,
                        gameId: gameId,
                        createdAt: new Date(),
                    },
                }),
            ]);
            return;
        }

        // Partie entre deux utilisateurs
        if (!game.playerWhiteId || !game.playerBlackId) return;

        const playerWhite = await prisma.user.findUnique({ where: { id: game.playerWhiteId } });
        const playerBlack = await prisma.user.findUnique({ where: { id: game.playerBlackId } });
        if (!playerWhite || !playerBlack) return;

        const ra = playerWhite.elo ?? 400;
        const rb = playerBlack.elo ?? 400;

        const expectedA = 1 / (1 + Math.pow(10, (rb - ra) / 400));
        const expectedB = 1 / (1 + Math.pow(10, (ra - rb) / 400));

        let scoreA = 0.5, scoreB = 0.5;
        if (result === "WHITE_WIN") { scoreA = 1; scoreB = 0; }
        else if (result === "BLACK_WIN") { scoreA = 0; scoreB = 1; }

        const Ka = chooseK(ra);
        const Kb = chooseK(rb);

        const newRa = Math.round(ra + Ka * (scoreA - expectedA));
        const newRb = Math.round(rb + Kb * (scoreB - expectedB));

        await prisma.$transaction([
            prisma.user.update({ where: { id: playerWhite.id }, data: { elo: newRa } }),
            prisma.user.update({ where: { id: playerBlack.id }, data: { elo: newRb } }),
            prisma.ratingHistory.create({ data: { userId: playerWhite.id, oldElo: ra, newElo: newRa, gameId, createdAt: new Date() } }),
            prisma.ratingHistory.create({ data: { userId: playerBlack.id, oldElo: rb, newElo: newRb, gameId, createdAt: new Date() } }),
        ]);
    }

    /**
     * Démarre une partie
     */
    static async startGame(
        gameId: string,
        playerWhiteId: string,
        playerBlackId: string
    ): Promise<GameState> {
        await prisma.game.update({
            where: { id: gameId },
            data: {
                status: "IN_PROGRESS",
                playerWhiteId,
                playerBlackId,
            },
        });

        return (await this.getGameState(gameId))!;
    }

    /**
     *  Sauvegarde un message de chat
     */

    static async saveChatMessage(
        gameId: string,
        chatMessage: ChatMessage,
    ): Promise<void> {
        await prisma.chatMessage.create({
            data: {
                gameId,
                userId: chatMessage.userId,
                message: chatMessage.message,
                sentAt: chatMessage.sentAt,
            },
        });
    }
}
