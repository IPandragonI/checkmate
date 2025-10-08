"use client";

import React, {useEffect, useMemo, useRef, useState, useCallback} from "react";
import {Chessboard} from "react-chessboard";
import {ChessEngine} from "@/app/components/chessBoard/ChessEngine";
import {getCustomPieces} from "@/app/components/chessBoard/CustomPieces";
import {getBoardStyles} from "@/app/components/chessBoard/ChessOptions";
import {Square} from "chess.js";

interface ChessboardWrapperProps {
    squareSize?: number;
    boardOrientation?: "white" | "black";
    botElo?: number;
    isStatic?: boolean;
    isOnline?: boolean;
    onMove?: ((move: { fromSquare: string; toSquare: string; promotion?: string; fen: string | null; isGameOver: boolean; gameOverReason: string | null }) => void) | null;
    boardState?: string;
    canPlay?: boolean;
}

const ChessboardWrapper: React.FC<ChessboardWrapperProps> = ({
                                                                 squareSize = 62,
                                                                 boardOrientation = "white",
                                                                 botElo,
                                                                 isStatic = true,
                                                                 isOnline = false,
                                                                 onMove = null,
                                                                 boardState,
                                                                 canPlay = true,
                                                             }) => {
    const chessEngineRef = useRef<ChessEngine>(new ChessEngine(undefined, botElo));
    const chessEngine = chessEngineRef.current;

    const [chessPosition, setChessPosition] = useState<string>(chessEngine.getFen());
    const [moveFrom, setMoveFrom] = useState<Square | null>(null);
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

    const pieceComponents = useMemo(() => {
        const pcs = getCustomPieces(squareSize);
        Object.entries(pcs).forEach(([key, val]) => {
            if (!val) console.error(`Piece '${key}' is undefined in getCustomPieces`);
        });
        return pcs;
    }, [squareSize]);
    const boardStyles = getBoardStyles();

    const updatePosition = useCallback(() => {
        setChessPosition(chessEngine.getFen());
    }, [chessEngine]);

    const makeBotMove = useCallback(() => {
        if (chessEngine.makeBotMove()) {
            updatePosition();
        }
    }, [chessEngine, updatePosition]);

    const getMoveOptions = useCallback((square: Square) => {
        const moves = chessEngine.getMovesFrom(square);
        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }
        const newSquares: Record<string, React.CSSProperties> = {};
        for (const move of moves) {
            newSquares[move.to] = {
                background:
                    chessEngine.getPiece(move.to) &&
                    chessEngine.getPiece(move.to)?.color !== chessEngine.getPiece(square)?.color
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
    }, [chessEngine]);


    const onSquareClick = useCallback(({square, piece}: { square: Square; piece?: string }) => {
        if (!moveFrom && piece && canPlay) {
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
        if (isOnline && onMove) {
            if (!canPlay) {
                setMoveFrom(null);
                setOptionSquares({});
                return;
            }
            onMove({
                fromSquare: moveFrom,
                toSquare: square,
                promotion: foundMove.promotion,
                fen: chessEngine.getFenAfterMove(moveFrom, square, foundMove.promotion),
                isGameOver: chessEngine.isGameOver(),
                gameOverReason: chessEngine.getGameOverReason(),
            });
            chessEngine.move(moveFrom, square, foundMove.promotion);
            updatePosition();
            setMoveFrom(null);
            setOptionSquares({});
            return;
        }
        if (chessEngine.move(moveFrom, square)) {
            updatePosition();
            setTimeout(makeBotMove, 300);
        }
        setMoveFrom(null);
        setOptionSquares({});
    }, [moveFrom, chessEngine, getMoveOptions, updatePosition, makeBotMove, isOnline, onMove, canPlay]);


    const onPieceDrop = useCallback(({sourceSquare, targetSquare}: { sourceSquare: string; targetSquare: string }) => {
        if (!targetSquare) return false;
        if (isOnline && onMove) {
            if (!canPlay) {
                setMoveFrom(null);
                setOptionSquares({});
                return false;
            }
            const moves = chessEngine.getMovesFrom(sourceSquare);
            const foundMove = moves.find((m) => m.from === sourceSquare && m.to === targetSquare);
            if (foundMove) {
                onMove({
                    fromSquare: sourceSquare,
                    toSquare: targetSquare,
                    promotion: foundMove.promotion,
                    fen: chessEngine.getFenAfterMove(sourceSquare, targetSquare, foundMove.promotion),
                    isGameOver: chessEngine.isGameOver(),
                    gameOverReason: chessEngine.getGameOverReason(),
                });
            }
            chessEngine.move(sourceSquare, targetSquare, foundMove?.promotion);
            updatePosition();
            setMoveFrom(null);
            setOptionSquares({});
            return false;
        }
        if (chessEngine.move(sourceSquare, targetSquare)) {
            updatePosition();
            setMoveFrom(null);
            setOptionSquares({});
            if (!isOnline && botElo) {
                setTimeout(makeBotMove, 500);
            }
            return true;
        }
        return false;
    }, [chessEngine, updatePosition, isOnline, botElo, onMove, makeBotMove, canPlay]);


    useEffect(() => {
        updatePosition();
    }, [boardOrientation, updatePosition]);

    useEffect(() => {
        chessEngine.setBotElo(botElo);
    }, [botElo, chessEngine]);

    useEffect(() => {
        if (boardState) {
            chessEngine.setFen(boardState);
            setChessPosition(chessEngine.getFen());
        }
    }, [boardState, chessEngine]);

    const chessboardOptions = {
        ...boardStyles,
        pieces: pieceComponents,
        boardOrientation,
        squareStyles: optionSquares,
        arePiecesDraggable: false,
    };

    const position = (boardState ?? chessPosition).split(" ")[0];

    if (!isStatic) {
        Object.assign(chessboardOptions, {
            onSquareClick,
            onPieceDrop,
            position,
            showAnimations: true,
        });
    }

    return (
        <div className="w-full h-full aspect-square flex items-center justify-center">
            <Chessboard options={chessboardOptions}/>
        </div>
    );
};

export default ChessboardWrapper;
