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
import {GameService} from "@/server/services/gameServices";
// IMPORTANT: ne pas importer de services serveur (ex: GameService) dans un composant client
// Utiliser à la place des endpoints API server-side (par ex. POST /api/games/[gameId]/move)

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

    const isBotGame = !!initialGame.bot;
    const isOnlineGame = !isBotGame;

    const orientation: "white" | "black" = user?.id === gameState.playerBlack?.id ? "black" : "white";

    const currentTurn = chessRef.current.turn() === "w"
        ? gameState.playerWhite?.id ? gameState.playerWhite?.id : initialGame.bot?.id
        : gameState.playerBlack?.id ? gameState.playerBlack?.id : initialGame.bot?.id;
    const canPlay = user?.id === currentTurn;

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

            setShowMatchAnnouncement(true);
        };

        const onMove = (move: Move) => {
            console.log("Received move:", move);

            chessRef.current.move({
                from: move.from,
                to: move.to,
                promotion: move.promotion,
            });

            setGameState((prev) => ({
                ...prev,
                currentFen: move.fen,
                moves: [...prev.moves, move],
                capturedPieces: {
                    ...prev.capturedPieces,
                    [chessRef.current.turn() === "w" ? "black" : "white"]: [
                        ...prev.capturedPieces[chessRef.current.turn() === "w" ? "black" : "white"],
                        ...(move.capturedPiece ? [move.capturedPiece] : []),
                    ],
                },
            }));
        };

        const onGameOver = (data: { result: string; finalFen: string }) => {
            console.log("Game over:", data);
            chessRef.current.load(data.finalFen);

            Swal.fire({
                title: "Game Over!",
                text: `Result: ${data.result}`,
                icon: "info",
                confirmButtonText: "View Game",
            })
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
    }, [user?.id, isBotGame, gameState.id, router]);

    useEffect(() => {
        if (!showMatchAnnouncement) return;
        const playerWhite = gameState.playerWhite?.id ? gameState.playerWhite?.username : gameState.bot?.name || "White";
        const playerBlack = gameState.playerBlack?.id ? gameState.playerBlack?.username : gameState.bot?.name || "Black";

        Swal.fire({
            title: "Match starts!",
            html: `<b>${playerWhite}</b> (White) vs <b>${playerBlack}</b> (Black)`,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        }).then(() => {
            setShowMatchAnnouncement(false);
        });
    }, [showMatchAnnouncement, gameState.playerWhite, gameState.playerBlack, gameState.bot?.name]);

    const handleMove = useCallback(
        async (move: Omit<Move, "fen" | "moveNumber">) => {
            if (isOnlineGame && !canPlay) return;

            const moveNumber = gameState.moves.length + 1;

            const result = chessRef.current.move({
                from: move.from,
                to: move.to,
                promotion: move.promotion,
            });

            if (!result) return;

            const completeMove: Move = {
                ...move,
                fen: chessRef.current.fen(),
                moveNumber,
                capturedPiece: result.captured,
            };

            if (isBotGame) {
                try {
                    const res = await fetch(`/api/games/${gameState.id}/move`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ move: completeMove }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Erreur serveur");
                } catch (err: any) {
                    console.error("Failed to save bot move:", err);
                    Swal.fire("Error", err?.message || "Erreur serveur", "error");
                }
            } else {
                socketRef.current?.emit("move", {
                    gameId: gameState.id,
                    move: completeMove,
                });
            }

            setGameState((prev) => ({
                ...prev,
                currentFen: completeMove.fen,
                moves: [...prev.moves, completeMove],
                capturedPieces: {
                    ...prev.capturedPieces,
                    [chessRef.current.turn() === "w" ? "black" : "white"]: [
                        ...prev.capturedPieces[chessRef.current.turn() === "w" ? "black" : "white"],
                        ...(completeMove.capturedPiece ? [completeMove.capturedPiece] : []),
                    ],
                },
            }));
        },
        [isBotGame, canPlay, gameState.id, gameState.moves.length, isOnlineGame]
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
                    isBotTurn={isBotGame && currentTurn === initialGame.bot?.id}
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

export default GameBoardClient;
