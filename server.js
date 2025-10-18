import {createServer} from "node:http";
import next from "next";
import {Server} from "socket.io";
import {PrismaClient} from "@prisma/client";
import {Chess} from "chess.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({dev, hostname, port});
const handler = app.getRequestHandler();
const prisma = new PrismaClient();

const games = [];

async function startNewGame(gameId, io) {
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

    const updatedGame = await prisma.game.findUnique({
        where: {id: gameId},
        include: {
            playerWhite: true,
            playerBlack: true
        }
    });
    debugger
    io.to(gameId).emit("start", {
        playerWhite: updatedGame.playerWhite,
        playerBlack: updatedGame.playerBlack,
        status: "IN_PROGRESS",
    });
}

async function fetchExistingGame(socket, existingGame, gameId, io) {
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

    if (existingGame.status === "FINISHED") {
        socket.emit("gameOver", {
            result: existingGame.result,
        });
        return;
    }

    io.to(gameId).emit("start", {
        playerWhite: existingGame.playerWhite,
        playerBlack: existingGame.playerBlack,
        status: existingGame.status,
        moves,
        chatMessages,
    });
}

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer, {
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
                    include: {
                        playerWhite: true,
                        playerBlack: true
                    }
                });
                if (existingGame.status === "WAITING") {
                    await startNewGame(gameId, io);
                } else {
                    await fetchExistingGame(socket, existingGame, gameId, io);
                }
            }
        });

        socket.on("move", async ({gameId, move}) => {
            await prisma.move.create({
                data: {
                    gameId,
                    moveNumber: move.moveNumber,
                    from: move.from,
                    to: move.to,
                    promotion: move.promotion || null,
                    fen: move.fen,
                },
            });
            socket.to(gameId).emit("move", move);

            const chess = new Chess(move.fen);
            if (chess.isGameOver()) {
                const winner = chess.turn() === 'w' ? 'black' : 'white';
                let result;
                if (chess.isCheckmate()) result = winner === 'white' ? 'WHITE_WIN' : 'BLACK_WIN';
                else if (chess.isDraw()) result = 'DRAW';
                else if (chess.isDrawByFiftyMoves()) result = 'DRAW';
                else if (chess.isStalemate()) result = 'STALEMATE';
                else if (chess.isThreefoldRepetition()) result = 'REPETITION';
                else if (chess.isInsufficientMaterial()) result = 'STALEMATE';
                else result = 'DRAW';
                await prisma.game.update({
                    where: {id: gameId},
                    data: {
                        result,
                        finishedAt: new Date().toISOString(),
                        status: 'FINISHED',
                    },
                });
                io.to(gameId).emit("gameOver", {
                    result,
                });
            }
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