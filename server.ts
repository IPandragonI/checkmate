import {createServer} from "node:http";
import next from "next";
import {Server} from "socket.io";
import {GameService} from "@/server/services/gameServices";
import {ServerToClientEvents, ClientToServerEvents} from "@/app/types/game";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({dev, hostname, port});
const handler = app.getRequestHandler();

const gameRooms = new Map<string, Set<string>>();
const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
        cors: {
            origin: [
                "http://localhost:3000",
                "https://checkmate-io.up.railway.app"
            ],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on("join", async ({gameId, userId}) => {
            try {
                socket.join(gameId);
                socket.data.userId = userId;
                socket.data.gameId = gameId;

                if (!gameRooms.has(gameId)) {
                    gameRooms.set(gameId, new Set());
                }
                gameRooms.get(gameId)!.add(socket.id);

                if (disconnectTimers.has(gameId)) {
                    clearTimeout(disconnectTimers.get(gameId)!);
                    disconnectTimers.delete(gameId);
                }

                const gameState = await GameService.getGameState(gameId);
                if (!gameState) {
                    socket.emit("error", "Game not found");
                    return;
                }

                const socketsInRoom = gameRooms.get(gameId)!;

                if (gameState.status === "WAITING" && socketsInRoom.size == 2) {
                    const [player1Id, player2Id] = Array.from(socketsInRoom)
                        .map((sid) => io.sockets.sockets.get(sid)?.data.userId)
                        .filter(Boolean);

                    if (player1Id && player2Id) {
                        const isPlayer1White = Math.random() < 0.5;
                        const whiteId = isPlayer1White ? player1Id : player2Id;
                        const blackId = isPlayer1White ? player2Id : player1Id;

                        const updatedState = await GameService.startGame(
                            gameId,
                            whiteId,
                            blackId
                        );

                        io.to(gameId).emit("start", {
                            playerWhite: updatedState.playerWhite!,
                            playerBlack: updatedState.playerBlack!,
                            gameState: updatedState,
                        });
                    }
                } else if (gameState.status === "IN_PROGRESS") {
                    const isPlayer =
                        userId === gameState.playerWhite?.id ||
                        userId === gameState.playerBlack?.id;

                    if (!isPlayer) {
                        socket.leave(gameId);
                        gameRooms.get(gameId)!.delete(socket.id);
                        socket.emit("error", "You are not a player in this game");
                        return;
                    }

                    socket.emit("start", {
                        playerWhite: gameState.playerWhite!,
                        playerBlack: gameState.playerBlack!,
                        gameState,
                    });
                } else if (gameState.status === "WAITING") {
                    io.to(gameId).emit("waiting");
                }
            } catch (error) {
                console.error("Error in join handler:", error);
                socket.emit("error", "Failed to join game");
            }
        });

        socket.on("move", async ({gameId, move}) => {
            try {
                const gameState = await GameService.getGameState(gameId);
                if (!gameState) {
                    socket.emit("error", "Game not found");
                    return;
                }

                const validation = GameService.validateAndApplyMove(
                    gameState.currentFen,
                    move
                );

                if (!validation.valid) {
                    socket.emit("error", "Invalid move");
                    return;
                }

                const completeMove = {
                    ...move,
                    fen: validation.newFen!,
                    capturedPiece: validation.capturedPiece,
                };
                await GameService.saveMove(gameId, completeMove);
                socket.to(gameId).emit("move", completeMove);
                const gameOverCheck = GameService.checkGameOver(validation.newFen!);

                if (gameOverCheck.isOver) {
                    await GameService.finishGame(gameId, gameOverCheck.result!);
                    io.to(gameId).emit("gameOver", {
                        result: gameOverCheck.result!,
                        finalFen: validation.newFen!,
                    });
                }
            } catch (error) {
                console.error("Error in move handler:", error);
                socket.emit("error", "Failed to process move");
            }
        });

        socket.on("messageSend", async ({gameId, chatMessage}) => {
            try {
                await GameService.saveChatMessage(gameId, chatMessage);
                io.to(gameId).emit("messageReceived", chatMessage);
            } catch (error) {
                console.error("Error in messageSend handler:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
            const gameId = socket.data.gameId;
            if (gameId && gameRooms.has(gameId)) {
                gameRooms.get(gameId)!.delete(socket.id);

                if (!disconnectTimers.has(gameId)) {
                    const timer = setTimeout(() => {
                        const room = gameRooms.get(gameId);
                        if (!room || room.size === 0) {
                            gameRooms.delete(gameId);
                        }

                        if (room && room.size < 2) {
                            io.to(gameId).emit("waiting");
                        }

                        disconnectTimers.delete(gameId);
                    }, 3000);

                    disconnectTimers.set(gameId, timer);
                }
            }
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});