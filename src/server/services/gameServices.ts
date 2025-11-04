import { PrismaClient } from "@prisma/client";
import { Chess } from "chess.js";
import { GameState, Move, Player } from "@/app/types/game";

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

        //Evolution du classement contre un bot désactivée pour le moment

        // if (game.botId) {
        //     const humanId = game.playerWhiteId ?? game.playerBlackId;
        //     if (!humanId) return;
        //
        //     const [human, bot] = await Promise.all([
        //         prisma.user.findUnique({ where: { id: humanId } }),
        //         prisma.bot.findUnique({ where: { id: game.botId } }),
        //     ]);
        //
        //     if (!human || !bot) return;
        //
        //     const rh = human.elo ?? 400;
        //     const rb = bot.elo ?? 400;
        //
        //     const expectedH = 1 / (1 + Math.pow(10, (rb - rh) / 400));
        //
        //     let scoreH: number;
        //     const humanIsWhite = humanId === game.playerWhiteId;
        //     if (result === "WHITE_WIN") {
        //         scoreH = humanIsWhite ? 1 : 0;
        //     } else if (result === "BLACK_WIN") {
        //         scoreH = humanIsWhite ? 0 : 1;
        //     } else {
        //         scoreH = 0.5;
        //     }
        //
        //     const K = 32;
        //     const newRh = Math.round(rh + K * (scoreH - expectedH));
        //
        //     await prisma.$transaction([
        //         prisma.user.update({ where: { id: human.id }, data: { elo: newRh } }),
        //         prisma.ratingHistory.create({
        //             data: {
        //                 userId: human.id,
        //                 oldElo: rh,
        //                 newElo: newRh,
        //                 gameId: gameId,
        //                 createdAt: new Date(),
        //             },
        //         }),
        //     ]);
        //
        //     return;
        // }

        const playerWhite = await prisma.user.findUnique({
            where: {id: game.playerWhiteId!},
        });
        const playerBlack = await prisma.user.findUnique({
            where: {id: game.playerBlackId!},
        });

        if (!playerWhite || !playerBlack) return;

        const ra = playerWhite.elo ?? 400;
        const rb = playerBlack.elo ?? 400;

        const expectedA = 1 / (1 + Math.pow(10, (rb - ra) / 400));
        const expectedB = 1 / (1 + Math.pow(10, (ra - rb) / 400));

        let scoreA: number;
        let scoreB: number;
        if (result === "WHITE_WIN") {
            scoreA = 1; scoreB = 0;
        } else if (result === "BLACK_WIN") {
            scoreA = 0; scoreB = 1;
        } else {
            scoreA = 0.5; scoreB = 0.5;
        }

        const K = 32;

        const newRa = Math.round(ra + K * (scoreA - expectedA));
        const newRb = Math.round(rb + K * (scoreB - expectedB));

        await prisma.$transaction([
            prisma.user.update({
                where: {id: playerWhite.id},
                data: {elo: newRa},
            }),
            prisma.user.update({
                where: {id: playerBlack.id},
                data: {elo: newRb},
            }),
        ]);

        await prisma.$transaction([
            prisma.ratingHistory.create({
                data: {
                    userId: playerWhite.id,
                    oldElo: ra,
                    newElo: newRa,
                    gameId: gameId,
                    createdAt: new Date(),
                },
            }),
            prisma.ratingHistory.create({
                data: {
                    userId: playerBlack.id,
                    oldElo: rb,
                    newElo: newRb,
                    gameId: gameId,
                    createdAt: new Date(),
                },
            }),
        ])
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
}
