import {Chess, Square} from "chess.js";
import {Move} from "@/app/components/chessBoard/ChessboardWrapper";

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
        this.game.load(fen);
    }

    isGameOver(): boolean {
        return this.game.isGameOver();
    }

    getMovesFrom(square: Square | null) {
        if (!square) return [];
        return this.game.moves({square, verbose: true});
    }

    getFenAfterMove(from: string, to: string, promotion: string = "q"): string | null {
        const clone = new Chess(this.game.fen());
        try {
            clone.move({from, to, promotion});
            return clone.fen();
        } catch {
            return null;
        }
    }

    move(from: string, to: string, promotion: string = "q"): boolean {
        try {
            this.game.move({from, to, promotion});
            return true;
        } catch {
            return false;
        }
    }

    evaluatePosition(fen: string): number {
        const pieceValues: Record<string, number> = {p: 1, n: 3, b: 3, r: 5, q: 9, k: 0};
        let score = 0;
        const fenParts = fen.split(' ');
        const board = fenParts[0];
        for (const char of board) {
            if (char >= '1' && char <= '8') continue;
            if (char === '/') continue;
            const isWhite = char === char.toUpperCase();
            const value = pieceValues[char.toLowerCase()] || 0;
            score += isWhite ? value : -value;
        }

        if (fenParts[1] === 'w') score += 0.1;
        if (fen.includes('KQkq')) score += 0.2;
        if (fen.includes('e4') || fen.includes('d4')) score += 0.2;
        if (fen.includes('e5') || fen.includes('d5')) score -= 0.2;
        return score;
    }

    makeBotMove(): Move | null {
        const possibleMoves = this.game.moves({verbose: true});
        if (this.isGameOver() || possibleMoves.length === 0) return null;

        const captures = possibleMoves.filter(m => m.captured);
        const checks = possibleMoves.filter(m => m.flags?.includes('c'));
        const promotions = possibleMoves.filter(m => m.flags?.includes('p'));
        const attacks = possibleMoves.filter(m => m.captured || m.flags?.includes('c'));
        const developments = possibleMoves.filter(m => {
            return ['n', 'b'].includes(m.piece) && ((m.from[1] === '1' && m.color === 'w') || (m.from[1] === '8' && m.color === 'b'));
        });
        const neutralMoves = possibleMoves.filter(m => !m.captured && !m.flags?.includes('c') && !m.flags?.includes('p'));

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
            let chosenMove = bestMoves[0];
            if (this.botElo < 1800 && bestMoves.length > 1 && Math.random() < 0.3) {
                chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
            }
            this.game.move(chosenMove);
            return chosenMove;
        }

        if (!this.botElo || this.botElo < 600) {
            if (Math.random() < 0.2 && neutralMoves.length > 0) {
                const badMove = neutralMoves[Math.floor(Math.random() * neutralMoves.length)];
                this.game.move(badMove);
                return badMove;
            }
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            this.game.move(randomMove);
            return randomMove;
        }

        if (this.botElo < 1000) {
            if (captures.length > 0 && Math.random() < 0.7) {
                const move = captures[Math.floor(Math.random() * captures.length)];
                this.game.move(move);
                return move;
            }
            if (developments.length > 0 && Math.random() < 0.3) {
                const move = developments[Math.floor(Math.random() * developments.length)];
                this.game.move(move);
                return move;
            }
            if (Math.random() < 0.1 && neutralMoves.length > 0) {
                const badMove = neutralMoves[Math.floor(Math.random() * neutralMoves.length)];
                this.game.move(badMove);
                return badMove;
            }
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            this.game.move(randomMove);
            return randomMove;
        }

        if (this.botElo < 1400) {
            if (promotions.length > 0 && Math.random() < 0.5) {
                const move = promotions[Math.floor(Math.random() * promotions.length)];
                this.game.move(move);
                return move;
            }
            if (captures.length > 0 && Math.random() < 0.7) {
                const move = captures[Math.floor(Math.random() * captures.length)];
                this.game.move(move);
                return move;
            }
            if (checks.length > 0 && Math.random() < 0.4) {
                const move = checks[Math.floor(Math.random() * checks.length)];
                this.game.move(move);
                return move;
            }
            if (developments.length > 0 && Math.random() < 0.5) {
                const move = developments[Math.floor(Math.random() * developments.length)];
                this.game.move(move);
                return move;
            }
            const goodMoves = [...captures, ...checks, ...developments];
            if (goodMoves.length > 0) {
                const move = goodMoves[Math.floor(Math.random() * goodMoves.length)];
                this.game.move(move);
                return move;
            }
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            this.game.move(randomMove);
            return randomMove;
        }

        if (this.botElo < 1800) {
            if (promotions.length > 0) {
                this.game.move(promotions[0]);
                return promotions[0];
            }
            if (captures.length > 0) {
                this.game.move(captures[0]);
                return captures[0];
            }
            if (checks.length > 0) {
                this.game.move(checks[0]);
                return checks[0];
            }
            if (developments.length > 0) {
                this.game.move(developments[0]);
                return developments[0];
            }
            this.game.move(possibleMoves[0]);
            return possibleMoves[0];
        }

        if (promotions.length > 0) {
            this.game.move(promotions[0]);
            return promotions[0];
        }
        if (captures.length > 0) {
            this.game.move(captures[0]);
            return captures[0];
        }
        if (checks.length > 0) {
            this.game.move(checks[0]);
            return checks[0];
        }
        if (developments.length > 0) {
            this.game.move(developments[0]);
            return developments[0];
        }
        if (attacks.length > 0) {
            this.game.move(attacks[0]);
            return attacks[0];
        }
        this.game.move(possibleMoves[0]);
        return possibleMoves[0];
    }

    getPiece(square: Square) {
        return this.game.get(square);
    }
}
