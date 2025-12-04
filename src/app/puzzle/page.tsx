"use client";

import React, {useEffect, useState, useCallback, useRef} from "react";
import GameLayout from "@/app/components/game/GameLayout";
import PuzzleInfos from "@/app/components/game/panel/PuzzleInfos";
import ChessboardWrapper, {HIGHLIGHT_SQUARE_COLOR} from "@/app/components/chessBoard/ChessboardWrapper";
import {Move} from "@/app/types/game";
import {Chess} from "chess.js";
import { createAudioController, AudioController } from '@/lib/audio';

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
    const [helpSquare, setHelpSquare] = useState<Record<string, React.CSSProperties>[]>([]);
    const [helpMove, setHelpMove] = useState<Move[]>([]);
    const [helpLevel, setHelpLevel] = useState<number>(0);
    const chessRefPrevFen = useRef<string | undefined>(undefined);
    const progressRef = useRef<number>(0); // number of half-moves already applied from solution
    const audioCtrlRef = useRef<AudioController | null>(null);

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
            setHelpLevel(0);
            setHelpSquare([]);
            setHelpMove([]);
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

    useEffect(() => {
        try {
            audioCtrlRef.current = createAudioController();
        } catch (e) {
            console.warn('Audio init failed', e);
        }

        function unlockAudioOnce() {
            try {
                if (!audioCtrlRef.current) audioCtrlRef.current = createAudioController();
                audioCtrlRef.current.playSound({} as Move, { startOrEnd: 'START' });
            } catch (e) {
                // ignore
            }
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('pointerdown', unlockAudioOnce, { once: true });
        }

        return () => {
            try { audioCtrlRef.current?.dispose(); audioCtrlRef.current = null; } catch (e) {}
            try { if (typeof window !== 'undefined') window.removeEventListener('pointerdown', unlockAudioOnce as any); } catch (e) {}
        };
    }, []);

    const handleMove = useCallback(async (move: Move, _isBotMove: boolean) => {
        if (!puzzle) return;
        let chess: Chess;
        if (move.fen) {
            chess = new Chess(move.fen);
        } else {
            chess = new Chess(chessRefPrevFen.current);
            chess.move({from: move.from, to: move.to, promotion: move.promotion || 'q'});
        }
        try {
            if (!audioCtrlRef.current) {
                try { audioCtrlRef.current = createAudioController(); } catch (e) { /* ignore */ }
            }
            const isCastle = chess.get(move.to as any)?.type === 'k' && ['g1','c1','g8','c8'].includes(move.to);
            audioCtrlRef.current?.playSound(move, { isCheck: chess.isCheck(), isCastle });
        } catch (e) {}

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
        setHelpLevel(0);
        setHelpSquare([]);
        setHelpMove([]);
        progressRef.current = idx + 1;

        chessRefPrevFen.current = chess.fen();
        setCurrentFen(chess.fen());
        setMoves(prevMoves => [...prevMoves, move]);

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

    const helpPuzzle = useCallback(() => {
        if (!puzzle) return;
        const idx = progressRef.current;
        const nextMove = puzzle.solution[idx];
        if (!nextMove) return;

        const newHelpLevel = helpLevel + 1;
        if (helpLevel != 2) setHelpLevel(newHelpLevel);

        if (newHelpLevel === 1) {
            setHelpSquare([{[nextMove.from]: {backgroundColor: HIGHLIGHT_SQUARE_COLOR}}]);
        } else if (newHelpLevel === 2) {
            setHelpMove([nextMove]);
        }
    }, [puzzle, helpLevel]);

    return (
        <GameLayout
            chessBoard={
                <ChessboardWrapper
                    boardOrientation={boardOrientation}
                    currentFen={currentFen}
                    onMove={handleMove}
                    isStatic={isStatic}
                    resetKey={resetKey}
                    highlightedSquares={helpSquare}
                    highlightedMoves={helpMove}
                />
            }
            gamePanel={
                <PuzzleInfos
                    loading={loading}
                    message={message}
                    puzzleNumber={puzzle?.number || 0}
                    difficulty={puzzle?.difficulty || 0}
                    onReset={resetPuzzle}
                    onHelp={helpPuzzle}
                />
            }
        />
    );
}