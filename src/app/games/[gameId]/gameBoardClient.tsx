"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Chess } from "chess.js";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { getSocket } from "@/socket";
import ChessboardWrapper from "@/app/components/chessBoard/ChessboardWrapper";
import GameInfos from "@/app/components/game/panel/GameInfos";
import GameWaiting from "@/app/components/game/panel/GameWaiting";
import GameLayout from "@/app/components/game/GameLayout";
import { GameState, Move, Player } from "@/app/types/game";
import Swal from "sweetalert2";
import {handleGameOver} from "@/app/games/utils/gameUtils";

interface GameBoardClientProps {
    initialGame: GameState;
}

const GameBoardClient: React.FC<GameBoardClientProps> = ({ initialGame }) => {
    const { data: session } = useSession();
    const user = session?.user;
    const router = useRouter();

    const [gameState, setGameState] = useState<GameState>(initialGame);
    const [waiting, setWaiting] = useState(initialGame.status === "WAITING");
    const [showMatchAnnouncement, setShowMatchAnnouncement] = useState(false);

    const socketRef = useRef<any>(null);
    const chessRef = useRef(new Chess(initialGame.currentFen));
    const matchAnnouncementShownRef = useRef(false);

    const isBotGame = !!initialGame.bot;
    const isOnlineGame = !isBotGame;

    const orientation: "white" | "black" =
        user?.id === gameState.playerBlack?.id ? "black" : "white";

    const currentTurn = chessRef.current.turn() === "w"
        ? (gameState.playerWhite?.id || initialGame.bot?.id)
        : (gameState.playerBlack?.id || initialGame.bot?.id);

    const canPlay = user?.id === currentTurn && gameState.status === "IN_PROGRESS";
    const isBotTurn = isBotGame && currentTurn === initialGame.bot?.id;

    const applyMove = useCallback((move: Move) => {
        setGameState((prev) => {
            const newMoves = [...prev.moves, move];
            const capturedPieces = { ...prev.capturedPieces };

            if (move.capturedPiece) {
                const capturingColor = chessRef.current.turn() === "w" ? "black" : "white";
                capturedPieces[capturingColor] = [
                    ...capturedPieces[capturingColor],
                    move.capturedPiece,
                ];
            }

            return {
                ...prev,
                currentFen: move.fen,
                moves: newMoves,
                capturedPieces,
            };
        });
    }, []);

    const onGameOver = useCallback((data: { result: string; finalFen: string }) => {
        console.log("Game over:", data);

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

        handleGameOver({
            chess: chessRef.current,
            playerWhite: gameState.playerWhite,
            playerBlack: gameState.playerBlack,
            moves: gameState.moves,
            chatMessages: gameState.chatMessages || [],
            gameId: gameState.id,
            router,
        });
    }, [gameState.chatMessages, gameState.id, gameState.moves, gameState.playerBlack, gameState.playerWhite, router]);

    useEffect(() => {
        if (!user?.id || isBotGame) return;

        const socket = getSocket(user.id);
        socketRef.current = socket;

        const onWaiting = () => {
            console.log("Waiting for opponent...");
            setWaiting(true);
        };

        const onStart = (data: {
            playerWhite: Player;
            playerBlack: Player;
            gameState: GameState;
        }) => {
            console.log("Game started:", data);
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

            if (!matchAnnouncementShownRef.current) {
                setShowMatchAnnouncement(true);
                matchAnnouncementShownRef.current = true;
            }
        };

        const onMove = (move: Move) => {
            console.log("Received move:", move);

            try {
                chessRef.current.move({
                    from: move.from,
                    to: move.to,
                    promotion: move.promotion,
                });
                applyMove(move);
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

        const joinGame = () => {
            socket.emit("join", { gameId: gameState.id, userId: user.id });
        };

        if (socket.connected) {
            joinGame();
        } else {
            socket.once("connect", joinGame);
        }

        return () => {
            socket.off("waiting", onWaiting);
            socket.off("start", onStart);
            socket.off("move", onMove);
            socket.off("gameOver", onGameOver);
            socket.off("error", onError);
            socket.off("connect", joinGame);
        };
    }, [user?.id, isBotGame, gameState.id, onGameOver, applyMove]);

    useEffect(() => {
        if (!showMatchAnnouncement) return;

        const playerWhite = gameState.playerWhite?.username || "Bot";
        const playerBlack = gameState.playerBlack?.username || "Bot";
        const botName = gameState.bot?.label || gameState.bot?.name;

        const whiteName = gameState.playerWhite ? playerWhite : botName;
        const blackName = gameState.playerBlack ? playerBlack : botName;

        Swal.fire({
            title: "Match starts!",
            html: `<b>${whiteName}</b> (White) vs <b>${blackName}</b> (Black)`,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        }).then(() => {
            setShowMatchAnnouncement(false);
        });
    }, [showMatchAnnouncement, gameState.playerWhite, gameState.playerBlack, gameState.bot]);

    const handleMove = useCallback(
        async (move: Omit<Move, "fen" | "moveNumber">) => {
            if (gameState.status === "FINISHED") return;
            if (isOnlineGame && !canPlay) return;
            if (isBotGame && isBotTurn) return;

            const moveNumber = gameState.moves.length + 1;

            const chess = new Chess(chessRef.current.fen());
            const result = chess.move({
                from: move.from,
                to: move.to,
                promotion: move.promotion || "q",
            });

            if (!result) {
                console.error("Invalid move");
                return;
            }

            const completeMove: Move = {
                ...move,
                fen: chess.fen(),
                moveNumber,
                capturedPiece: result.captured,
            };

            if (isBotGame) {
                try {
                    chessRef.current.move(result);
                    applyMove(completeMove);

                    const res = await fetch(`/api/games/${gameState.id}/move`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ move: completeMove }),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(data.error || "Erreur serveur");
                    }

                    if (data.botMove) {
                        setTimeout(() => {
                            chessRef.current.move({
                                from: data.botMove.from,
                                to: data.botMove.to,
                                promotion: data.botMove.promotion,
                            });
                            applyMove(data.botMove);

                            if (data.gameOver) {
                                onGameOver({
                                    result: data.result,
                                    finalFen: data.botMove.fen,
                                });
                            }
                        }, 500);
                    } else if (data.gameOver) {
                        onGameOver({
                            result: data.result,
                            finalFen: completeMove.fen,
                        });
                    }
                } catch (err: any) {
                    console.error("Failed to save bot move:", err);
                    chessRef.current.load(gameState.currentFen);
                    setGameState((prev) => ({ ...prev, currentFen: gameState.currentFen }));
                    Swal.fire("Error", err?.message || "Erreur serveur", "error");
                }
            }
            else {
                chessRef.current.move(result);
                applyMove(completeMove);

                socketRef.current?.emit("move", {
                    gameId: gameState.id,
                    move: completeMove,
                });
            }
        },
        [isBotGame, canPlay, gameState.id, gameState.moves.length, gameState.currentFen, gameState.status, isOnlineGame, isBotTurn, applyMove, onGameOver]
    );

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
                    boardState={gameState.currentFen}
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
        />
    );
};

export { GameBoardClient };