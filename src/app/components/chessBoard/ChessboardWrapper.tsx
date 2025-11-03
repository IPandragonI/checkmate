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
    fen?: string | null;
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
                                                                 isStatic = true, 
                                                                 isBotTurn = false,
                                                             }) => {

    const isBotMode = !isOnline && !!botElo && !isStatic;
    const isOnlineMode = isOnline && !isStatic;

    const chessEngineRef = useRef<ChessEngine>(new ChessEngine(boardState, botElo));
    const chessEngine = chessEngineRef.current;

    const [moveFrom, setMoveFrom] = useState<Square | null>(null);
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

    const pieceComponents = getCustomPieces();
    const boardStyles = getBoardStyles();
    
    useEffect(() => {
        if (boardState) chessEngine.setFen(boardState);
    }, [boardState, chessEngine]);

    useEffect(() => {
        if (isBotMode) {
            chessEngine.setBotElo(botElo);
        }
    }, [botElo, isBotMode, chessEngine]);

    const makeBotMove = useCallback(() => {
        if (!isBotMode) return;

        setTimeout(() => {
            const botMove = chessEngine.makeBotMove();
            if (botMove !== null) {
                setOptionSquares({});
                if (onMove) {
                    onMove({
                        from: botMove.from,
                        to: botMove.to,
                        promotion: botMove.promotion,
                        fen: botMove.fen,
                    });
                }
            }
        }, 500);
    }, [isBotMode, chessEngine, onMove]);

    useEffect(() => {
        if (isBotMode && isBotTurn) {
            makeBotMove();
        }
    }, [isBotMode, makeBotMove, isBotTurn]);

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

            if (isOnlineMode && !canPlay) {
                setMoveFrom(null);
                setOptionSquares({});
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

            if (onMove) {
                const fen = chessEngine.getFenAfterMove(
                    moveFrom,
                    square,
                    foundMove.promotion
                );

                onMove({
                    from: moveFrom,
                    to: square,
                    promotion: foundMove.promotion,
                    fen: fen || chessEngine.getFen(),
                });

                chessEngine.move(moveFrom, square);

                setMoveFrom(null);
                setOptionSquares({});
                return;
            }

            chessEngine.move(moveFrom, square);
            setMoveFrom(null);
            setOptionSquares({});
        },
        [isStatic, isOnlineMode, canPlay, moveFrom, chessEngine, getMoveOptions, onMove]
    );

    const onPieceDrop = useCallback(
        ({ sourceSquare, targetSquare }: { sourceSquare: Square; targetSquare: string }) => {
            if (isStatic) return false;

            if (isOnlineMode && !canPlay) {
                return false;
            }

            if (!targetSquare) return false;

            const moves = chessEngine.getMovesFrom(sourceSquare);
            const foundMove = moves.find(
                (m) => m.from === sourceSquare && m.to === targetSquare
            );

            if (!foundMove) return false;

            if (onMove) {
                const fen = chessEngine.getFenAfterMove(
                    sourceSquare,
                    targetSquare,
                    foundMove.promotion
                );

                onMove({
                    from: sourceSquare,
                    to: targetSquare,
                    promotion: foundMove.promotion,
                    fen: fen || chessEngine.getFen(),
                });
                chessEngine.move(sourceSquare, targetSquare);
                return true;
            }

            return false;
        },
        [isStatic, isOnlineMode, canPlay, chessEngine, onMove]
    );

    const getCurrentPosition = () => {
        if (isOnlineMode && boardState) {
            return boardState.split(" ")[0];
        }
        return chessEngine.getFen().split(" ")[0];
    };

    const chessboardOptions: any = {
        ...boardStyles,
        pieces: pieceComponents,
        boardOrientation,
        position: getCurrentPosition(),
        squareStyles: optionSquares,
        allowDragging: !isStatic,
    };

    if (!isStatic) {
        chessboardOptions.onSquareClick = onSquareClick;
        chessboardOptions.onPieceDrop = onPieceDrop;
        chessboardOptions.showAnimations = true;
    }

    return (
        <div className="w-full h-full aspect-square flex items-center justify-center">
            <Chessboard options={chessboardOptions} />
        </div>
    );
};

export default ChessboardWrapper;