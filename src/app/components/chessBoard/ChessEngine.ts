import { Chess, Square, Move as ChessMove } from "chess.js";

export class ChessEngine {
    private game: Chess;
    private botElo: number | undefined;

    constructor(fen?: string, botElo?: number) {
        this.game = new Chess(fen);
        this.botElo = botElo;
    }

    setBotElo(elo?: number) {
        this.botElo = elo;
    }

    getFen(): string {
        return this.game.fen();
    }

    setFen(fen: string): void {
        try {
            this.game.load(fen);
        } catch (e) {
            console.error("Failed to load FEN:", fen, e);
        }
    }

    isGameOver(): boolean {
        return this.game.isGameOver();
    }

    getMovesFrom(square: Square | null) {
        if (!square) return [];
        return this.game.moves({ square, verbose: true });
    }

    getFenAfterMove(from: string, to: string, promotion: string = "q"): string | null {
        const clone = new Chess(this.game.fen());
        try {
            clone.move({ from, to, promotion });
            return clone.fen();
        } catch {
            return null;
        }
    }

    move(from: string, to: string, promotion: string = "q"): boolean {
        try {
            this.game.move({ from, to, promotion });
            return true;
        } catch {
            return false;
        }
    }

    evaluatePosition(fen: string): number {
        const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        let score = 0;
        const fenParts = fen.split(" ");
        const board = fenParts[0];

        for (const char of board) {
            if (char >= "1" && char <= "8") continue;
            if (char === "/") continue;
            const isWhite = char === char.toUpperCase();
            const value = pieceValues[char.toLowerCase()] || 0;
            score += isWhite ? value : -value;
        }

        if (fenParts[1] === "w") score += 0.1;
        if (fen.includes("KQkq")) score += 0.2;
        if (fen.includes("e4") || fen.includes("d4")) score += 0.2;
        if (fen.includes("e5") || fen.includes("d5")) score -= 0.2;

        return score;
    }

    makeBotMove(): { from: string; to: string; promotion?: string; fen: string } | null {
        const possibleMoves = this.game.moves({ verbose: true });
        if (this.isGameOver() || possibleMoves.length === 0) return null;

        const captures = possibleMoves.filter((m) => m.captured);
        const checks = possibleMoves.filter((m) => m.flags?.includes("c"));
        const promotions = possibleMoves.filter((m) => m.flags?.includes("p"));
        const developments = possibleMoves.filter((m) => {
            return (
                ["n", "b"].includes(m.piece) &&
                ((m.from[1] === "1" && m.color === "w") || (m.from[1] === "8" && m.color === "b"))
            );
        });
        const neutralMoves = possibleMoves.filter(
            (m) => !m.captured && !m.flags?.includes("c") && !m.flags?.includes("p")
        );

        let chosenMove: ChessMove;

        if (this.botElo && this.botElo >= 1200) {
            let bestScore = -Infinity;
            let bestMoves: typeof possibleMoves = [];

            for (const move of possibleMoves) {
                const clone = new Chess(this.game.fen());
                clone.move(move);
                const score = this.evaluatePosition(clone.fen());

                if (score > bestScore) {
                    bestScore = score;
                    bestMoves = [move];
                } else if (score === bestScore) {
                    bestMoves.push(move);
                }
            }

            chosenMove = bestMoves[0];
            if (this.botElo < 1800 && bestMoves.length > 1 && Math.random() < 0.3) {
                chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
            }
        } else if (!this.botElo || this.botElo < 600) {
            if (Math.random() < 0.2 && neutralMoves.length > 0) {
                chosenMove = neutralMoves[Math.floor(Math.random() * neutralMoves.length)];
            } else {
                chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
        } else if (this.botElo < 1000) {
            if (captures.length > 0 && Math.random() < 0.7) {
                chosenMove = captures[Math.floor(Math.random() * captures.length)];
            } else if (developments.length > 0 && Math.random() < 0.3) {
                chosenMove = developments[Math.floor(Math.random() * developments.length)];
            } else {
                chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
        } else if (this.botElo < 1400) {
            if (promotions.length > 0 && Math.random() < 0.5) {
                chosenMove = promotions[Math.floor(Math.random() * promotions.length)];
            } else if (captures.length > 0 && Math.random() < 0.7) {
                chosenMove = captures[Math.floor(Math.random() * captures.length)];
            } else if (checks.length > 0 && Math.random() < 0.4) {
                chosenMove = checks[Math.floor(Math.random() * checks.length)];
            } else {
                const goodMoves = [...captures, ...checks, ...developments];
                chosenMove = goodMoves.length > 0
                    ? goodMoves[Math.floor(Math.random() * goodMoves.length)]
                    : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
        } else if (this.botElo < 1800) {
            if (promotions.length > 0) {
                chosenMove = promotions[0];
            } else if (captures.length > 0) {
                chosenMove = captures[0];
            } else if (checks.length > 0) {
                chosenMove = checks[0];
            } else {
                chosenMove = possibleMoves[0];
            }
        } else {
            if (promotions.length > 0) {
                chosenMove = promotions[0];
            } else if (captures.length > 0) {
                chosenMove = captures[0];
            } else if (checks.length > 0) {
                chosenMove = checks[0];
            } else {
                chosenMove = possibleMoves[0];
            }
        }

        const fen = this.getFenAfterMove(chosenMove.from, chosenMove.to, chosenMove.promotion);

        if (!fen) return null;

        return {
            from: chosenMove.from,
            to: chosenMove.to,
            promotion: chosenMove.promotion,
            fen,
        };
    }

    getPiece(square: Square) {
        return this.game.get(square);
    }
}