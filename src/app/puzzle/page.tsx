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
    const [resetKey, setResetKey] = useState<number>(0);
    const chessRefPrevFen = useRef<string | undefined>(undefined);
    const progressRef = useRef<number>(0); // number of half-moves already applied from solution

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
            progressRef.current = 0;
            setResetKey(k => k + 1);
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
    }, fetchNext: () => Promise<void>) {
        setLoading(true);
        try {
            const res = await fetch('/api/puzzles/solve', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({puzzleId: puzzle.puzzleId})
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

        const idx = progressRef.current;
        const expected = puzzle.solution[idx];

        if (!expected || expected.from !== move.from || expected.to !== move.to) {
            setMessage("Coup incorrect, réessayez.");
            setMoves([]);
            setCurrentFen(puzzle.startFen);
            setIsStatic(false);
            chessRefPrevFen.current = puzzle.startFen;
            progressRef.current = 0;
            return;
        }

        setMessage("");
        progressRef.current = idx + 1;

        let chess: Chess;
        if (move.fen) {
            chess = new Chess(move.fen);
        } else {
            chess = new Chess(chessRefPrevFen.current);
            chess.move({from: move.from, to: move.to, promotion: move.promotion || 'q'});
        }

        let appliedOpponentMove: Move | null = null;
        if (progressRef.current < puzzle.solution.length) {
            const opp = puzzle.solution[progressRef.current];
            const res = chess.move({from: opp.from, to: opp.to, promotion: opp.promotion || 'q'});
            if (res) {
                appliedOpponentMove = opp as Move;
                progressRef.current = progressRef.current + 1;
            }
        }

        const newFen = chess.fen();
        setCurrentFen(newFen);
        chessRefPrevFen.current = newFen;

        if (appliedOpponentMove) {
            setMoves(prev => [...prev, move, appliedOpponentMove as Move]);
        } else {
            setMoves(prev => [...prev, move]);
        }

        if (progressRef.current >= puzzle.solution.length) {
            await saveSolved(setLoading, puzzle, fetchNext);
        }
    }, [puzzle, fetchNext]);

    const resetPuzzle = useCallback(() => {
        if (!puzzle) return;
        setMoves([]);
        setCurrentFen(puzzle.startFen);
        setMessage("");
        setIsStatic(false);
        chessRefPrevFen.current = puzzle.startFen;
        progressRef.current = 0;
        setResetKey(k => k + 1);
    }, [puzzle]);

    return (
        <GameLayout
            chessBoard={
                <ChessboardWrapper
                    boardOrientation={boardOrientation}
                    currentFen={currentFen}
                    onMove={handleMove}
                    isStatic={isStatic}
                    resetKey={resetKey}
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