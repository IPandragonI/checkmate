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
    const [matchAnnounced, setMatchAnnounced] = useState(false);

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
            router,
        });
    }, [gameState.playerBlack, gameState.playerWhite, router]);

    useEffect(() => {
        if (!user?.id) return;

        if (gameState.status === "FINISHED") {
            handleGameOver({
                chess: chessRef.current,
                playerWhite: gameState.playerWhite,
                playerBlack: gameState.playerBlack,
                router,
            });
            return;
        }

        if (isBotGame) return;

        const socket = getSocket(user.id);
        socketRef.current = socket;

        const onConnect = () => {
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
                }));
            } catch (e) {
                console.error("Failed to apply move:", e);
            }
        };

        const onError = (message: string) => {
            console.error("Socket error:", message);
            Swal.fire("Error", message, "error");
        };

        socket.on("connect", onConnect);
        socket.on("waiting", onWaiting);
        socket.on("start", onStart);
        socket.on("move", onMove);
        socket.on("gameOver", onGameOver);
        socket.on("error", onError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("waiting", onWaiting);
            socket.off("start", onStart);
            socket.off("move", onMove);
            socket.off("gameOver", onGameOver);
            socket.off("error", onError);
        };
    }, [user?.id, isBotGame, gameState.id, onGameOver, matchAnnounced]);

    useEffect(() => {
        if (!showMatchAnnouncement) return;

        const playerWhite = gameState.playerWhite?.username || "Bot";
        const playerBlack = gameState.playerBlack?.username || "Bot";
        const botName = gameState.bot?.label || gameState.bot?.username;

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
        async (move: Move) => {
            if (gameState.status === "FINISHED") return;
            if (isOnlineGame && !canPlay) return;

            const moveNumber = gameState.moves.length + 1;
            const completeMove: Move = {
                ...move,
                moveNumber
            };

            debugger

            if (isBotGame) {
                try {
                    const res = await fetch(`/api/games/${gameState.id}/move`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ move: completeMove }),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(data.error || "Erreur serveur");
                    }

                    setGameState((prev) => ({
                        ...prev,
                        currentFen: move.fen,
                        moves: [...prev.moves, completeMove],
                    }));

                    const chess = new Chess(move.fen);
                    const isGameOver = chess.isGameOver();

                    if (isGameOver) {
                        handleGameOver({
                            chess,
                            playerWhite: gameState.playerWhite,
                            playerBlack: gameState.playerBlack,
                            router,
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
                socketRef.current?.emit("move", {
                    gameId: gameState.id,
                    move: completeMove,
                });
            }
        },
        [isBotGame, canPlay, gameState.id, gameState.moves.length, gameState.currentFen, gameState.status, isOnlineGame, isBotTurn, onGameOver]
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
        />
    );
};

export { GameBoardClient };