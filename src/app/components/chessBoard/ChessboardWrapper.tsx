"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { ChessEngine } from "@/app/components/chessBoard/ChessEngine";
import { getCustomPieces } from "@/app/components/chessBoard/CustomPieces";
import { getBoardStyles } from "@/app/components/chessBoard/ChessOptions";
import { Square } from "chess.js";

export interface Move {
    from: string;
    to: string;
    promotion?: string;
    fen?: string;
}

interface ChessboardWrapperProps {
    boardOrientation?: "white" | "black";
    botElo?: number;
    isOnline?: boolean;
    onMove?: (move: Move) => void;
    boardState?: string;
    canPlay?: boolean;
    isStatic?: boolean;
    isBotTurn?: boolean;
}

const ChessboardWrapper: React.FC<ChessboardWrapperProps> = ({
                                                                 boardOrientation = "white",
                                                                 botElo,
                                                                 isOnline = false,
                                                                 onMove,
                                                                 boardState,
                                                                 canPlay = true,
                                                                 isStatic = false,
                                                                 isBotTurn = false,
                                                             }) => {
    const isBotMode = !isOnline && !!botElo && !isStatic;

    const chessEngineRef = useRef<ChessEngine>(new ChessEngine(boardState, botElo));
    const chessEngine = chessEngineRef.current;

    const [moveFrom, setMoveFrom] = useState<Square | null>(null);
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

    const pieceComponents = getCustomPieces();
    const boardStyles = getBoardStyles();

    useEffect(() => {
        if (boardState) {
            try {
                chessEngine.setFen(boardState);
            } catch (e) {
                console.error("Invalid FEN:", e);
            }
        }
    }, [boardState, chessEngine]);

    useEffect(() => {
        if (isBotMode) {
            chessEngine.setBotElo(botElo);
        }
    }, [botElo, isBotMode, chessEngine]);

    const getMoveOptions = useCallback(
        (square: Square) => {
            const moves = chessEngine.getMovesFrom(square);
            if (moves.length === 0) {
                setOptionSquares({});
                return false;
            }

            const newSquares: Record<string, React.CSSProperties> = {};

            for (const move of moves) {
                const isCapture =
                    chessEngine.getPiece(move.to) &&
                    chessEngine.getPiece(move.to)?.color !== chessEngine.getPiece(square)?.color;

                newSquares[move.to] = {
                    background: isCapture
                        ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
                        : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
                    borderRadius: "50%",
                };
            }

            newSquares[square] = {
                background: "rgba(255, 255, 0, 0.4)",
            };

            setOptionSquares(newSquares);
            return true;
        },
        [chessEngine]
    );

    const onSquareClick = useCallback(
        ({ square, piece }: { square: Square; piece?: string }) => {
            if (isStatic) return;

            if (!canPlay) {
                setMoveFrom(null);
                setOptionSquares({});
                return;
            }

            if (isBotMode && isBotTurn) {
                return;
            }

            if (!moveFrom && piece) {
                const hasMoveOptions = getMoveOptions(square);
                if (hasMoveOptions) setMoveFrom(square);
                return;
            }

            if (!moveFrom) return;

            const moves = chessEngine.getMovesFrom(moveFrom);
            const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);

            if (!foundMove) {
                const hasMoveOptions = getMoveOptions(square);
                setMoveFrom(hasMoveOptions ? square : null);
                return;
            }

            const fen = chessEngine.getFenAfterMove(
                moveFrom,
                square,
                foundMove.promotion
            );

            if (!fen) {
                console.error("Failed to calculate FEN");
                return;
            }

            if (onMove) {
                onMove({
                    from: moveFrom,
                    to: square,
                    promotion: foundMove.promotion,
                    fen,
                });
            }

            setMoveFrom(null);
            setOptionSquares({});
        },
        [
            isStatic,
            canPlay,
            isBotMode,
            isBotTurn,
            moveFrom,
            chessEngine,
            getMoveOptions,
            onMove,
        ]
    );

    const onPieceDrop = useCallback(
        ({ sourceSquare, targetSquare }: { sourceSquare: Square; targetSquare: string }) => {
            if (isStatic) return false;

            if (!canPlay) {
                return false;
            }

            if (isBotMode && isBotTurn) {
                return false;
            }

            if (!targetSquare) return false;

            const moves = chessEngine.getMovesFrom(sourceSquare);
            const foundMove = moves.find(
                (m) => m.from === sourceSquare && m.to === targetSquare
            );

            if (!foundMove) return false;

            const fen = chessEngine.getFenAfterMove(
                sourceSquare,
                targetSquare,
                foundMove.promotion
            );

            if (!fen) {
                console.error("Failed to calculate FEN");
                return false;
            }

            if (onMove) {
                onMove({
                    from: sourceSquare,
                    to: targetSquare,
                    promotion: foundMove.promotion,
                    fen,
                });
            }

            setMoveFrom(null);
            setOptionSquares({});

            return true;
        },
        [isStatic, canPlay, isBotMode, isBotTurn, chessEngine, onMove]
    );

    const getCurrentPosition = () => {
        if (boardState) {
            return boardState.split(" ")[0];
        }
        return chessEngine.getFen().split(" ")[0];
    };

    const chessboardOptions: any = {
        ...boardStyles,
        pieces: pieceComponents,
        boardOrientation,
        position: getCurrentPosition(),
        customSquareStyles: optionSquares,
        squareStyles: optionSquares,
        arePiecesDraggable: !isStatic && canPlay && !(isBotMode && isBotTurn),
        allowDragging: !isStatic,
        animationDuration: 300,
    };

    if (!isStatic) {
        chessboardOptions.onSquareClick = onSquareClick;
        chessboardOptions.onPieceDrop = onPieceDrop;
    }

    return (
        <div className="w-full h-full aspect-square flex items-center justify-center">
            <Chessboard options={chessboardOptions} />
        </div>
    );
};

export default ChessboardWrapper;