"use client";

import React, {useEffect, useState, useCallback, useRef} from "react";
import GameLayout from "@/app/components/game/GameLayout";
import PuzzleInfos from "@/app/components/game/panel/PuzzleInfos";
import ChessboardWrapper from "@/app/components/chessBoard/ChessboardWrapper";
import {Move} from "@/app/types/game";
import {Chess} from "chess.js";

export default function PuzzlePage() {
    const [puzzle, setPuzzle] = useState<{
        puzzleId: string;
        number: number;
        startFen: string;
        solution: Array<Move>;
        difficulty: number
    } | null>(null);
    const [currentFen, setCurrentFen] = useState<string | undefined>(undefined);
    const [moves, setMoves] = useState<Move[]>([]);
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [isStatic, setIsStatic] = useState(true);
    const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
    const chessRefPrevFen = useRef<string | undefined>(undefined);

    const determineBoardOrientation = (useCallback((fen: string) => {
        const parts = fen.split(' ');
        if (parts.length < 2) return "white";
        return parts[1] === 'w' ? "white" : "black";
    }, []));

    const fetchNext = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/puzzles/next');
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setLoading(false);
                setMessage(err.error || "Erreur lors du chargement du puzzle.");
                return;
            }
            const data = await res.json();
            setPuzzle({
                puzzleId: data.puzzleId,
                number: data.number,
                startFen: data.startFen,
                difficulty: data.difficulty,
                solution: data.solution || []
            });
            setCurrentFen(data.startFen);
            setMoves([]);
            setIsStatic(false);
            setMessage("");
            setBoardOrientation(determineBoardOrientation(data.startFen));
            chessRefPrevFen.current = data.startFen;
        } catch (e: any) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [determineBoardOrientation]);

    async function saveSolved(setLoading: (value: (((prevState: boolean) => boolean) | boolean)) => void, puzzle: {
        puzzleId: string;
        number: number;
        startFen: string;
        solution: Array<Move>;
        difficulty: number
    }, newMoves: Move[], fetchNext: () => Promise<void>) {
        setLoading(true);
        try {
            const res = await fetch('/api/puzzles/solve', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({puzzleId: puzzle.puzzleId, moves: newMoves})
            });
            if (!res.ok) {
                setLoading(false);
                setMessage("Erreur lors de l'enregistrement du puzzle.");
                return;
            }
            await fetchNext();
        } catch (e: any) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchNext();
    }, [fetchNext]);

    const handleMove = useCallback(async (move: Move, _isBotMove: boolean) => {
        if (!puzzle) return;
        const newMoves = [...moves, move];
        const solutionSoFar = puzzle.solution.slice(0, newMoves.length);

        const jsonSolutionMoveSoFar = solutionSoFar[newMoves.length - 1];
        const isCorrect = jsonSolutionMoveSoFar &&
            jsonSolutionMoveSoFar.from === move.from &&
            jsonSolutionMoveSoFar.to === move.to;
        debugger
        if (!isCorrect) {
            setMessage("Coup incorrect, réessayez.");
            setMoves([]);
            setCurrentFen(puzzle.startFen);
            setIsStatic(true)
            chessRefPrevFen.current = puzzle.startFen;
            return;
        }
        setMoves(newMoves);

        const chess = new Chess(chessRefPrevFen.current);
        const solutionNextMove = puzzle.solution[newMoves.length - 1];
        chess.move({from: solutionNextMove.from, to: solutionNextMove.to});
        const newFen = chess.fen();
        setCurrentFen(newFen);
        chessRefPrevFen.current = newFen;

        if (newMoves.length === puzzle.solution.length) {
            await saveSolved(setLoading, puzzle, newMoves, fetchNext);
        }
    }, [puzzle, moves, fetchNext]);

    const resetPuzzle = useCallback(() => {
        if (!puzzle) return;
        setMoves([]);
        setCurrentFen(puzzle.startFen);
        setMessage("");
        setIsStatic(false);
        chessRefPrevFen.current = puzzle.startFen;
    }, [puzzle]);

    return (
        <GameLayout
            chessBoard={
                <ChessboardWrapper
                    boardOrientation={boardOrientation}
                    currentFen={currentFen}
                    onMove={handleMove}
                    isStatic={isStatic}
                />
            }
            gamePanel={
                <PuzzleInfos
                    loading={loading}
                    message={message}
                    puzzleNumber={puzzle?.number || 0}
                    difficulty={puzzle?.difficulty || 0}
                    onReset={resetPuzzle}
                />
            }
        />
    );
}