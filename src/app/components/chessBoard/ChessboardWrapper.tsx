"use client";

import React, {useEffect, useRef, useState} from "react";
import {Chessboard, PieceDropHandlerArgs, SquareHandlerArgs} from "react-chessboard";
import {getBoardStyles} from "@/app/components/chessBoard/ChessOptions";
import {Chess, Square} from "chess.js";
import {Move} from "@/app/types/game";
import {computeBotMove} from "@/app/games/utils/botEngine";

interface ChessboardWrapperProps {
    boardOrientation?: "white" | "black";
    botElo?: number;
    isOnline?: boolean;
    onMove?: (move: Move, isBotMove: boolean) => void;
    currentFen?: string;
    canPlay?: boolean;
    isStatic?: boolean;
    isBotTurn?: boolean;
}

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const ChessboardWrapper: React.FC<ChessboardWrapperProps> = ({
                                                                 boardOrientation = "white",
                                                                 botElo,
                                                                 isOnline = false,
                                                                 onMove,
                                                                 currentFen,
                                                                 canPlay = true,
                                                                 isStatic = true,
                                                                 isBotTurn = false,
                                                             }) => {
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    const [chessPosition, setChessPosition] = useState(chessGame.fen());
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState({});
    const [firstMoveMade, setFirstMoveMade] = useState(false);

    const boardStyles = getBoardStyles();

    useEffect(() => {
        if (currentFen && chessGame.fen() !== currentFen) {
            chessGame.load(currentFen);
            setChessPosition(currentFen);
            return
        }

    }, [currentFen]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const GLOBAL_FLAG = '__checkmate_bot_first_move_done';
        if ((window as any)[GLOBAL_FLAG]) return;

        if (botElo && !isOnline && !canPlay && isBotTurn && !firstMoveMade && chessGame.fen() === DEFAULT_FEN) {
            (window as any)[GLOBAL_FLAG] = true;
            setFirstMoveMade(true);
            setTimeout(makeBotMove, 500);
        }
    }, [botElo, isOnline, canPlay, isBotTurn, firstMoveMade]);

    function makeBotMove() {
        if (chessGame.isGameOver()) {
            return;
        }

        const botMove = computeBotMove(chessGame, botElo as number);

        const fenBefore = chessGame.fen();
        const move = chessGame.move(botMove);

        const fenAfter = move ? getFenAfterMove(move.from, move.to, fenBefore) : chessGame.fen();
        onMove && onMove({
            from: move?.from,
            to: move?.to,
            promotion: 'q',
            fen: fenAfter as string,
            capturedPiece: move?.captured
        }, true);
        setChessPosition(chessGame.fen());
    }

    function getFenAfterMove(from: Square, to: Square, baseFen?: string) {
        if (!from || !to) return null;
        const tempChess = new Chess(baseFen ?? chessGame.fen());
        try {
            const result = tempChess.move({ from, to, promotion: 'q' });
            if (!result) return null;
            return tempChess.fen();
        } catch {
            return null;
        }
    }

    function getMoveOptions(square: Square) {
        const moves = chessGame.moves({
            square,
            verbose: true
        });

        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares: Record<string, React.CSSProperties> = {};

        for (const move of moves) {
            newSquares[move.to] = {
                background: chessGame.get(move.to) && chessGame.get(move.to)?.color !== chessGame.get(square)?.color ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
                    : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                borderRadius: '50%'
            };
        }

        newSquares[square] = {
            background: 'rgba(255, 255, 0, 0.4)'
        };

        setOptionSquares(newSquares);

        return true;
    }

    function onSquareClick({
                               square,
                               piece
                           }: SquareHandlerArgs) {
        if (isStatic) return;

        if (!canPlay) {
            setMoveFrom('');
            setOptionSquares({});
            return;
        }

        if (!moveFrom && piece) {
            const hasMoveOptions = getMoveOptions(square as Square);

            if (hasMoveOptions) {
                setMoveFrom(square);
            }

            return;
        }

        const moves = chessGame.moves({
            square: moveFrom as Square,
            verbose: true
        });
        const foundMove = moves.find(m => m.from === moveFrom && m.to === square);

        if (!foundMove) {
            const hasMoveOptions = getMoveOptions(square as Square);

            setMoveFrom(hasMoveOptions ? square : '');
            return;
        }

        let move;
        try {
            const fenBefore = chessGame.fen();
            move = chessGame.move({
                from: moveFrom,
                to: square,
                promotion: 'q'
            });
            onMove && onMove({
                from: moveFrom,
                to: square,
                promotion: 'q',
                fen: getFenAfterMove(moveFrom as Square, square as Square, fenBefore) as string,
                capturedPiece: move?.captured
            }, false);
        } catch {
            const hasMoveOptions = getMoveOptions(square as Square);

            if (hasMoveOptions) {
                setMoveFrom(square);
            }

            return;
        }

        setChessPosition(chessGame.fen());

        const botMoveDelay = Math.random() * (3000 - 800) + 800;
        if (!isOnline && botElo) setTimeout(makeBotMove, botMoveDelay);

        setMoveFrom('');
        setOptionSquares({});
    }

    function onPieceDrop({
                             sourceSquare,
                             targetSquare
                         }: PieceDropHandlerArgs) {
        if (!targetSquare || isStatic || !canPlay) {
            return false;
        }

        try {
            const fenBefore = chessGame.fen();
            const move = chessGame.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q'
            });

            onMove && onMove({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
                fen: getFenAfterMove(move?.from as Square, move?.to as Square, fenBefore) as string,
                capturedPiece: move?.captured
            }, false);
            setChessPosition(chessGame.fen());

            setMoveFrom('');
            setOptionSquares({});

            const botMoveDelay = Math.random() * (3000 - 800) + 800;
            if (!isOnline && botElo) setTimeout(makeBotMove, botMoveDelay);

            return true;
        } catch {
            return false;
        }
    }

    const chessboardOptions = {
        ...boardStyles,
        position: chessPosition,
        squareStyles: optionSquares,
        id: 'click-or-drag-to-move'
    };

    if (!isStatic) {
        Object.assign(chessboardOptions, {
            onSquareClick: (args: SquareHandlerArgs) => onSquareClick(args),
            onPieceDrop: (args: PieceDropHandlerArgs) => onPieceDrop(args),
            boardOrientation: boardOrientation,
            arePiecesDraggable: canPlay && (!isOnline || isBotTurn),
        });
    }

    return (
        <div className="w-full h-full aspect-square flex items-center justify-center">
            <Chessboard options={chessboardOptions}/>
        </div>
    );
};

export default ChessboardWrapper;
