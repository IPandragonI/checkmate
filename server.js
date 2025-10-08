import {createServer} from "node:http";
import next from "next";
import {Server} from "socket.io";
import {PrismaClient} from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({dev, hostname, port});
const handler = app.getRequestHandler();
const prisma = new PrismaClient();

const games = {};

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);
    io.on("connection", (socket) => {
        socket.on("join", async ({gameId, userId}) => {
            socket.join(gameId);
            socket.userId = userId;
            if (!games[gameId]) games[gameId] = [];
            if (!games[gameId].includes(socket.id)) games[gameId].push(socket.id);
            if (games[gameId].length < 2) {
                io.to(gameId).emit("waiting");
            } else {
                const existingGame = await prisma.game.findUnique({
                    where: {id: gameId},
                });
                if (existingGame.status === "WAITING") {
                    const [player1, player2] = games[gameId];
                    const isPlayer1White = Math.random() < 0.5;
                    const playerWhiteSocket = isPlayer1White ? player1 : player2;
                    const playerBlackSocket = isPlayer1White ? player2 : player1;

                    const playerWhiteId = io.sockets.sockets.get(playerWhiteSocket)?.userId;
                    const playerBlackId = io.sockets.sockets.get(playerBlackSocket)?.userId;

                    await prisma.game.update({
                        where: {id: gameId},
                        data: {
                            status: "IN_PROGRESS",
                            playerWhiteId,
                            playerBlackId,
                        },
                    });

                    io.to(gameId).emit("start", {
                        playerWhiteId,
                        playerBlackId,
                        status: "IN_PROGRESS",
                    });
                } else {
                    if (socket.userId !== existingGame.playerWhiteId && socket.userId !== existingGame.playerBlackId) {
                        socket.leave(gameId);
                        games[gameId] = games[gameId].filter((id) => id !== socket.id);
                        socket.emit("error", "Game is already in progress with different players.");
                        return;
                    }

                    const moves = await prisma.move.findMany({
                        where: {gameId},
                        orderBy: {moveNumber: "asc"},
                    });
                    const chatMessages = await prisma.chatMessage.findMany({
                        where: {gameId},
                        orderBy: {sentAt: "asc"},
                    });

                    io.to(gameId).emit("start", {
                        playerWhiteId: existingGame.playerWhiteId,
                        playerBlackId: existingGame.playerBlackId,
                        status: existingGame.status,
                        moves,
                        chatMessages,
                    });
                }
            }
        });

        socket.on("move", async ({gameId, move}) => {
            await prisma.move.create({
                data: {
                    gameId,
                    moveNumber: move.moveNumber,
                    fromSquare: move.fromSquare,
                    toSquare: move.toSquare,
                    promotion: move.promotion || null,
                    fen: move.fen,
                },
            });
            socket.to(gameId).emit("move", move);
        });

        socket.on("messageSend", async ({gameId, msg}) => {
            await prisma.chatMessage.create({
                data: {
                    gameId,
                    userId: msg.userId,
                    message: msg.message,
                    sentAt: new Date(msg.sentAt),
                },
            });
            io.to(gameId).emit("messageReceived", msg);
        });

        socket.on("disconnect", () => {
            for (const gameId in games) {
                games[gameId] = games[gameId].filter((id) => id !== socket.id);
                if (games[gameId].length < 2) {
                    io.to(gameId).emit("waiting");
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