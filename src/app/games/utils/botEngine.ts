import { Chess, Move, PieceSymbol } from "chess.js";

const PIECE_VALUES: Record<PieceSymbol, number> = {
    p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000
};

export function computeBotMove(chess: Chess, botElo: number): string {
    const moves = chess.moves({ verbose: true });

    if (botElo < 1000) {
        return getRandomMove(moves);
    }

    if (botElo < 1500) {
        const goodCaps = moves.filter(m => m.captured &&
            PIECE_VALUES[m.captured!] >= PIECE_VALUES[m.piece]
        );
        if (goodCaps.length > 0) {
            return getRandomMove(goodCaps);
        }
        return getRandomMove(moves);
    }

    return getBestMoveMinimax(chess, moves, 2);
}

function getRandomMove(moves: Move[]): string {
    return moves[Math.floor(Math.random() * moves.length)].san;
}

function getBestMoveMinimax(chess: Chess, moves: Move[], depth: number): string {
    let bestScore = -Infinity;
    let bestMoves: Move[] = [];

    for (const move of moves) {
        chess.move(move);
        const score = minimax(chess, depth - 1, -Infinity, Infinity, false);
        chess.undo();

        if (score > bestScore) {
            bestScore = score;
            bestMoves = [move];
        } else if (score === bestScore) {
            bestMoves.push(move);
        }
    }

    return getRandomMove(bestMoves);
}

function minimax(chess: Chess, depth: number, alpha: number, beta: number, isMax: boolean): number {
    if (depth === 0 || chess.isGameOver()) {
        return evaluateSimple(chess);
    }

    const moves = chess.moves({ verbose: true });

    if (isMax) {
        let maxEval = -Infinity;
        for (const move of moves) {
            chess.move(move);
            maxEval = Math.max(maxEval, minimax(chess, depth - 1, alpha, beta, false));
            chess.undo();
            alpha = Math.max(alpha, maxEval);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            chess.move(move);
            minEval = Math.min(minEval, minimax(chess, depth - 1, alpha, beta, true));
            chess.undo();
            beta = Math.min(beta, minEval);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function evaluateSimple(chess: Chess): number {
    const board = chess.board();
    let score = 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                score += (piece.color === "w" ? 1 : -1) * PIECE_VALUES[piece.type];
            }
        }
    }
    return score;
}
