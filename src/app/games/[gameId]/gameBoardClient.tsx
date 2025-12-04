"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {Chess, Square} from "chess.js";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { getSocket } from "@/socket";
import ChessboardWrapper from "@/app/components/chessBoard/ChessboardWrapper";
import GameInfos from "@/app/components/game/panel/GameInfos";
import GameWaiting from "@/app/components/game/panel/GameWaiting";
import GameLayout from "@/app/components/game/GameLayout";
import { GameState, Move, Player } from "@/app/types/game";
import Swal from "sweetalert2";
import {getGameResult, handleGameOver} from "@/app/games/utils/gameUtils";
import { createAudioController, AudioController } from '@/lib/audio';

interface GameBoardProps {
    initialGame: GameState;
}

const GameBoard: React.FC<GameBoardProps> = ({ initialGame }) => {
    const { data: session } = useSession();
    const user = session?.user;
    const router = useRouter();

    const [gameState, setGameState] = useState<GameState>(initialGame);
    const [waiting, setWaiting] = useState(initialGame.status === "WAITING");
    const [showMatchAnnouncement, setShowMatchAnnouncement] = useState(false);
    const [matchAnnounced, setMatchAnnounced] = useState(false);

    const [whiteTimeLeft, setWhiteTimeLeft] = useState<number | null>(initialGame.whiteTimeLeft);
    const [blackTimeLeft, setBlackTimeLeft] = useState<number | null>(initialGame.blackTimeLeft);

    const socketRef = useRef<any>(null);
    const joinRef = useRef(false);
    const chessRef = useRef(new Chess(initialGame.currentFen));
    const matchAnnouncementShownRef = useRef(false);
    const gameStateRef = useRef<GameState>(initialGame);

    const audioCtrlRef = useRef<AudioController | null>(null);

    const lastMoveByMeRef = useRef(false);
    const timerIntervalRef = useRef<number | null>(null);
    const lastTickRef = useRef<number | null>(null);

    useEffect(() => {
        // create audio controller on mount
        try {
            audioCtrlRef.current = createAudioController();
        } catch (e) {
            console.warn('Audio init failed', e);
        }

        return () => {
            try {
                audioCtrlRef.current?.dispose();
                audioCtrlRef.current = null;
            } catch (e) {}
        };
    }, []);

    const playSound = useCallback((move: Move, startOrEnd?: string) => {
        try {
            const isCheck = chessRef.current.isCheck();
            const isCastle = chessRef.current.get(move.to as Square)?.type === 'k' && (move.to === 'g1' || move.to === 'c1' || move.to === 'g8' || move.to === 'c8');
            audioCtrlRef.current?.playSound(move, { isCheck, isCastle, startOrEnd: startOrEnd as any });
        } catch (e) {
            // ignore
        }
    }, []);

    const currentTurn = chessRef.current.turn() === "w" ? (gameState.playerWhite?.id || initialGame.bot?.id) : (gameState.playerBlack?.id || initialGame.bot?.id);
    const [canPlay, setCanPlay] = useState(user?.id === currentTurn && gameState.status === "IN_PROGRESS");

    const isBotGame = !!initialGame.bot;
    const isOnlineGame = !isBotGame;
    const orientation: "white" | "black" = user?.id === gameState.playerBlack?.id ? "black" : "white";
    const isBotTurn = isBotGame && currentTurn === initialGame.bot?.id;

    const onGameOver = useCallback((data: { result: string; finalFen: string }) => {
        setGameState((prev) => ({
            ...prev,
            status: "FINISHED",
            result: data.result,
            currentFen: data.finalFen,
        }));

        try {
            chessRef.current.load(data.finalFen);
        } catch (e) {
            console.error("Failed to load final FEN:", e);
        }

        playSound({} as Move, "END");
        handleGameOver({
            chess: chessRef.current,
            playerWhite: gameState.playerWhite,
            playerBlack: gameState.playerBlack,
            router,
        });
    }, [gameState.playerBlack, gameState.playerWhite, playSound, router]);

    useEffect(() => {
        if (!user?.id) return;

        if (gameState.status === "FINISHED") {
            playSound({} as Move, "END");
            handleGameOver({
                chess: chessRef.current,
                playerWhite: gameState.playerWhite,
                playerBlack: gameState.playerBlack,
                router,
            });
            return;
        }

        if (isBotGame) {
            if (gameState.status === "IN_PROGRESS" && !matchAnnouncementShownRef.current) {
                setShowMatchAnnouncement(true);
                setMatchAnnounced(true);
                matchAnnouncementShownRef.current = true;
                playSound({} as Move, "START");
            }
            return;
        }

        const socket = getSocket(user.id);
        socketRef.current = socket;

        if (!joinRef.current) {
            joinRef.current = true;
            socket.emit("join", { gameId: gameState.id, userId: user.id });
        }

        const onWaiting = () => {
            console.log("Waiting for opponent...");
            setWaiting(true);
        };

        const onStart = (data: {
            playerWhite: Player;
            playerBlack: Player;
            gameState: GameState;
        }) => {
            setWaiting(false);
            setGameState(data.gameState);

            const chess = new Chess();
            data.gameState.moves.forEach((move) => {
                chess.move({
                    from: move.from,
                    to: move.to,
                    promotion: move.promotion,
                });
            });
            chessRef.current = chess;

            setWhiteTimeLeft(data.gameState.whiteTimeLeft ?? null);
            setBlackTimeLeft(data.gameState.blackTimeLeft ?? null);

            const currentTurn = chess.turn() === "w" ? data.gameState.playerWhite?.id : data.gameState.playerBlack?.id;
            setCanPlay(user.id === currentTurn);

            if (!matchAnnouncementShownRef.current && !matchAnnounced) {
                setShowMatchAnnouncement(true);
                setMatchAnnounced(true);
                matchAnnouncementShownRef.current = true;
            }
        };

        const onMove = (move: Move) => {
            console.log("Received move:", move);

            try {
                setGameState((prev) => ({
                    ...prev,
                    currentFen: move.fen,
                    moves: [...prev.moves, move],
                    capturedPieces: {
                        white: move.capturedPiece && chessRef.current.turn() === "w"
                            ? [...prev.capturedPieces.white, move.capturedPiece]
                            : prev.capturedPieces.white,
                        black: move.capturedPiece && chessRef.current.turn() === "b"
                            ? [...prev.capturedPieces.black, move.capturedPiece]
                            : prev.capturedPieces.black,
                    },
                }));
                try {
                    chessRef.current.load(move.fen);
                } catch (e) {
                    console.warn('Failed to load FEN on onMove', e);
                }
                lastTickRef.current = Date.now();
                const currentTurn = chessRef.current.turn() === "w" ? gameStateRef.current.playerWhite?.id : gameStateRef.current.playerBlack?.id;
                if (user.id === currentTurn && gameStateRef.current.status === "IN_PROGRESS") setCanPlay(true);

                playSound(move);
            } catch (e) {
                console.error("Failed to apply move:", e);
            }
        };

        const onError = (message: string) => {
            console.error("Socket error:", message);
            Swal.fire("Error", message, "error");
        };

        socket.on("waiting", onWaiting);
        socket.on("start", onStart);
        socket.on("move", onMove);
        socket.on("gameOver", onGameOver);
        socket.on("error", onError);

        return () => {
            socket.off("waiting", onWaiting);
            socket.off("start", onStart);
            socket.off("move", onMove);
            socket.off("gameOver", onGameOver);
            socket.off("error", onError);
        };
    }, [user?.id, isBotGame, gameState.id, onGameOver, matchAnnounced, gameState.playerWhite, gameState.playerBlack, gameState.status, router, playSound]);

    useEffect(() => {
        if (!showMatchAnnouncement) return;

        const playerWhite = gameState.playerWhite?.username || "Bot";
        const playerBlack = gameState.playerBlack?.username || "Bot";
        const botName = gameState.bot?.username;

        const whiteName = gameState.playerWhite ? playerWhite : botName;
        const blackName = gameState.playerBlack ? playerBlack : botName;

        playSound({} as Move, "START");
        Swal.fire({
            title: "Match starts!",
            html: `<b>${whiteName}</b> (White) vs <b>${blackName}</b> (Black)`,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        }).then(() => {
            setShowMatchAnnouncement(false);
        });
    }, [showMatchAnnouncement, gameState.playerWhite, gameState.playerBlack, gameState.bot, playSound]);

    const handleMove = useCallback(
        async (move: Move, isBotMove: boolean) => {
            if (gameState.status === "FINISHED") return;
            if (isOnlineGame && !canPlay) return;

            const moveNumber = gameState.moves.length + 1;
            const completeMove: Move = {
                ...move,
                moveNumber
            };

            if (isBotGame) {
                try {
                    setCanPlay(false);
                    const chess = new Chess(move.fen);
                    const isGameOver = chess.isGameOver();
                    let result;

                    if (isGameOver) {
                        result = getGameResult(chess);
                        handleGameOver({
                            chess,
                            playerWhite: gameState.playerWhite,
                            playerBlack: gameState.playerBlack,
                            router,
                        });
                    }

                    const res = await fetch(`/api/games/${gameState.id}/move`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ move: completeMove, isGameOver, result, userPlayingId: isBotMove ? initialGame.bot?.id : user?.id }),
                    });

                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(data.error || "Erreur serveur");
                    }

                    setGameState((prev) => ({
                        ...prev,
                        currentFen: move.fen,
                        moves: [...prev.moves, completeMove],
                        capturedPieces: {
                            white: move.capturedPiece && chessRef.current.turn() === "w"
                                ? [...prev.capturedPieces.white, move.capturedPiece]
                                : prev.capturedPieces.white,
                            black: move.capturedPiece && chessRef.current.turn() === "b"
                                ? [...prev.capturedPieces.black, move.capturedPiece]
                                : prev.capturedPieces.black,
                        },
                    }));
                    try { chessRef.current.load(move.fen); } catch {}
                    lastTickRef.current = Date.now();

                    playSound(move);

                    if (isBotMove) {
                        setCanPlay(true);
                    }
                } catch (err: any) {
                    console.error("Failed to save bot move:", err);
                    chessRef.current.load(gameState.currentFen);
                    setGameState((prev) => ({ ...prev, currentFen: gameState.currentFen }));
                    Swal.fire("Error", err?.message || "Erreur serveur", "error");
                }
            } else {
                lastMoveByMeRef.current = true;
                setGameState((prev) => ({
                    ...prev,
                    currentFen: move.fen,
                    moves: [...prev.moves, completeMove],
                    capturedPieces: {
                        white: move.capturedPiece && chessRef.current.turn() === "w"
                            ? [...prev.capturedPieces.white, move.capturedPiece]
                            : prev.capturedPieces.white,
                        black: move.capturedPiece && chessRef.current.turn() === "b"
                            ? [...prev.capturedPieces.black, move.capturedPiece]
                            : prev.capturedPieces.black,
                    },
                }));

                try {
                    chessRef.current.load(move.fen);
                } catch (e) {
                    console.warn('Failed to load FEN after local move', e);
                }

                playSound(move);
                lastTickRef.current = Date.now();

                socketRef.current?.emit("move", {
                    gameId: gameState.id,
                    move: completeMove,
                    userId: user?.id,
                    timeLeft: chessRef.current.turn() === "w" ? whiteTimeLeft : blackTimeLeft,
                });

                setCanPlay(false);
            }
        },
        [gameState.status, gameState.moves.length, gameState.id, gameState.playerWhite, gameState.playerBlack, gameState.currentFen, isOnlineGame, canPlay, isBotGame, initialGame.bot?.id, user?.id, playSound, router, whiteTimeLeft, blackTimeLeft]
    );

    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

    useEffect(() => {
        const hasWhite = whiteTimeLeft != null;
        const hasBlack = blackTimeLeft != null;
        if (!hasWhite && !hasBlack) return;

        if (gameState.status !== 'IN_PROGRESS') return;

        if (!lastTickRef.current) lastTickRef.current = Date.now();

        const tick = () => {
            const now = Date.now();
            const last = lastTickRef.current ?? now;
            const delta = now - last;
            lastTickRef.current = now;

            const side = chessRef.current.turn();
            if (side === 'w' && whiteTimeLeft != null) {
                setWhiteTimeLeft((prev) => {
                    const next = (prev ?? 0) - delta;
                    if (next <= 0) {
                        clearInterval(timerIntervalRef.current ?? undefined);
                        timerIntervalRef.current = null;
                        setGameState((prevState) => ({ ...prevState, status: 'FINISHED', result: 'TIMEOUT', currentFen: chessRef.current.fen() }));
                        (async () => {
                            try {
                                const gs = gameStateRef.current;
                                if (gs.status === 'FINISHED') return;

                                const res = await fetch(`/api/games/${gs.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ result: 'TIMEOUT', winnerId: gs.playerBlack ? gs.playerBlack.id : gs.bot?.id }),
                                });

                                if (!res.ok) {
                                    const err = await res.json().catch(() => ({}));
                                    console.error('Failed to notify server about timeout (black wins):', err);
                                }

                                handleGameOver({ chess: chessRef.current, playerWhite: gs.playerWhite, playerBlack: gs.playerBlack ? gs.playerBlack : gs.bot, router });
                            } catch (e) {
                                console.error('Error while notifying server about timeout (black wins):', e);
                            }
                        })();
                        return 0;
                    }
                    return next;
                });
            } else if (side === 'b' && blackTimeLeft != null) {
                setBlackTimeLeft((prev) => {
                    const next = (prev ?? 0) - delta;
                    if (next <= 0) {
                        clearInterval(timerIntervalRef.current ?? undefined);
                        timerIntervalRef.current = null;
                        setGameState((prevState) => ({ ...prevState, status: 'FINISHED', result: 'TIMEOUT', currentFen: chessRef.current.fen() }));
                        (async () => {
                            try {
                                const gs = gameStateRef.current;
                                if (gs.status === 'FINISHED') return;

                                const res = await fetch(`/api/games/${gs.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ winnerId: gs.playerWhite ? gs.playerWhite.id : gs.bot?.id, result: 'TIMEOUT' }),
                                });

                                if (!res.ok) {
                                    const err = await res.json().catch(() => ({}));
                                    console.error('Failed to notify server about timeout (white wins):', err);
                                }

                                handleGameOver({ chess: chessRef.current, playerWhite: gs.playerWhite ? gs.playerWhite : gs.bot, playerBlack: gs.playerBlack, router });
                            } catch (e) {
                                console.error('Error while notifying server about timeout (white wins):', e);
                            }
                        })();
                        return 0;
                    }
                    return next;
                });
            }
        };

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = window.setInterval(tick, 500);

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            lastTickRef.current = null;
        };
    }, [gameState.status, whiteTimeLeft, blackTimeLeft, router]);

    if (isOnlineGame && waiting) {
        return (
            <GameLayout gamePanel={<GameWaiting value={initialGame.code || ""} />} />
        );
    }

    return (
        <GameLayout
            chessBoard={
                <ChessboardWrapper
                    boardOrientation={orientation}
                    currentFen={gameState.currentFen}
                    onMove={handleMove}
                    canPlay={canPlay}
                    isStatic={false}
                    isOnline={isOnlineGame}
                    botElo={initialGame.bot?.elo}
                    isBotTurn={isBotTurn}
                />
            }
            gamePanel={
                <GameInfos
                    game={gameState}
                    playerWhite={gameState.playerWhite}
                    playerBlack={gameState.playerBlack}
                    user={user}
                    moves={gameState.moves}
                    chatMessages={gameState.chatMessages || []}
                    socket={socketRef.current}
                />
            }
            isGameStarted={true}
            capturedPieces={gameState.capturedPieces}
            playerPlaying={chessRef.current.turn() === "w" ? "w" : "b"}
            whiteTimeLeft={whiteTimeLeft}
            blackTimeLeft={blackTimeLeft}
        />
    );
};

export { GameBoard };
