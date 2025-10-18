"use client";
import ChessboardWrapper, {Move} from "@/app/components/chessBoard/ChessboardWrapper";
import {useSession} from "@/lib/auth-client";
import GameInfos from "@/app/components/game/panel/GameInfos";
import {useEffect, useState, useRef} from "react";
import {getSocket} from "@/socket";
import {DEFAULT_POSITION} from "chess.js";
import {Chess} from "chess.js";
import Swal from "sweetalert2";
import GameLayout from "@/app/components/game/GameLayout";
import GameWaiting from "@/app/components/game/panel/GameWaiting";
import {useRouter} from "next/navigation";
import {handleGameOver} from "../utils/gameUtils";
import {GameBoardClientProps} from "../types/gameTypes";

const GameBoardClient: React.FC<GameBoardClientProps> = ({game}) => {
    const {data: session} = useSession();
    const user = session?.user;
    const router = useRouter();

    const socketRef = useRef<any>(null);
    const listenersAttachedRef = useRef(false);
    const [waiting, setWaiting] = useState(true);
    const [playerWhite, setPlayerWhite] = useState(game.playerWhite);
    const [playerBlack, setPlayerBlack] = useState(game.playerBlack);
    const [moveNumber, setMoveNumber] = useState(0);
    const [boardState, setBoardState] = useState(game.fen || DEFAULT_POSITION);
    const [moves, setMoves] = useState<Move[]>([]);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [showMatchAnnouncement, setShowMatchAnnouncement] = useState(false);
    const [matchAnnouncementShown, setMatchAnnouncementShown] = useState(false);

    const isBotGame = !!game.botId;
    const chess = useRef(new Chess(game.fen || DEFAULT_POSITION));

    let orientation: "white" | "black" = "white";
    if (user?.id === playerBlack?.id) orientation = "black";
    if (user?.id === playerWhite?.id) orientation = "white";

    const currentTurn = boardState.split(" ")[1] === "w" ? playerWhite?.id : playerBlack?.id;
    const canPlay = user?.id === currentTurn;
    const isReconnecting = game.status === "IN_PROGRESS" && (user?.id === playerWhite?.id || user?.id === playerBlack?.id) && (!socketRef.current || waiting) && !isBotGame;

    useEffect(() => {
        if (!user?.id || isBotGame) return;
        let socket = socketRef.current;
        if (!socket) {
            socket = getSocket(user.id);
            socketRef.current = socket;
        } else if (user.id) {
            socket.auth = { userId: user.id };
        }

        const onMove = (move: any) => {
            console.log("Reçu move:", move);
            setBoardState(move.fen);
            setMoveNumber(move.moveNumber);
            chess.current.move(move);
            setMoves((prevMoves) => [...prevMoves, move]);
            if (chess.current.isGameOver()) {
                handleGameOver({
                    chess: chess.current,
                    playerWhite,
                    playerBlack,
                    moves: [...moves, move],
                    chatMessages,
                    gameId: game.id,
                    router
                });
            }
        };

        const onWaiting = () => {
            console.log("En attente...");
            setWaiting(true);
        };

        const onStart = (data: any) => {
            debugger
            console.log("Début de partie:", data);
            setWaiting(false);
            setPlayerWhite(data.playerWhite);
            setPlayerBlack(data.playerBlack);
            setChatMessages(data.chatMessages || []);
            chess.current.load(data.fen || DEFAULT_POSITION);
            if (data.moves && Array.isArray(data.moves) && data.moves.length > 0) {
                chess.current.reset();
                data.moves.forEach((move: any) => {
                    chess.current.move({
                        from: move.from || move.from,
                        to: move.to || move.to,
                        promotion: move.promotion || undefined,
                    });
                });
                setBoardState(chess.current.fen());
                setMoveNumber(data.moves.length);
                setMoves(data.moves);
            }
            if (!matchAnnouncementShown) {
                setShowMatchAnnouncement(true);
                setMatchAnnouncementShown(true);
            }
        };

        const onGameOver = (data: any) => {
            console.log("Fin de partie:", data);
            setBoardState(data.fen);
            chess.current.load(data.fen);
            handleGameOver({
                chess: chess.current,
                playerWhite,
                playerBlack,
                moves,
                chatMessages,
                gameId: game.id,
                router
            });
        };

        if (!listenersAttachedRef.current) {
            socket.on("move", onMove);
            socket.on("waiting", onWaiting);
            socket.on("start", onStart);
            socket.on("gameOver", onGameOver);
            listenersAttachedRef.current = true;
        } else {
            socket.off("move"); socket.on("move", onMove);
            socket.off("waiting"); socket.on("waiting", onWaiting);
            socket.off("start"); socket.on("start", onStart);
            socket.off("gameOver"); socket.on("gameOver", onGameOver);
        }

        const sendJoin = () => {
            socket.emit("join", {gameId: game.id, userId: user.id});
        };

        if (socket.connected) {
            sendJoin();
        } else {
            socket.once("connect", sendJoin);
        }

        return () => {
            try {
                socket.off("move", onMove);
                socket.off("gameOver", onGameOver);
                socket.off("waiting", onWaiting);
                socket.off("start", onStart);
                socket.off("connect", sendJoin);
            } catch (e) {
                console.warn('Error during socket cleanup', e);
            }
            listenersAttachedRef.current = false;
        };
    }, [user?.id, isBotGame, game.id, playerWhite, playerBlack, moves, chatMessages, matchAnnouncementShown, router]);

    useEffect(() => {
        if (game.fen) {
            chess.current.load(game.fen);
        }
    }, [game.fen]);

    useEffect(() => {
        if (!showMatchAnnouncement) return;
        let timerInterval: NodeJS.Timeout | undefined;
        Swal.fire({
            title: "La partie commence !",
            html: `<b>${playerWhite?.username || "Joueur 1"}</b> (blancs) vs <b>${playerBlack?.username || "Joueur 2"}</b> (noirs)`,
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            },
            willClose: () => {
            }
        }).then(() => {
            setShowMatchAnnouncement(false);
        });
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [playerBlack?.username, playerWhite?.username, showMatchAnnouncement]);

    const handleMove = (move: Move) => {
        if (isBotGame) return;
        const nextMoveNumber = moveNumber + 1;
        chess.current.move(move);
        setBoardState(chess.current.fen());
        setMoveNumber(nextMoveNumber);
        setMoves([...moves, {...move, number: nextMoveNumber}]);
        if (socketRef.current) {
            console.log("Envoi move:", move);
            socketRef.current.emit("move", {
                gameId: game.id,
                move: {
                    ...move,
                    moveNumber: nextMoveNumber,
                },
            });
        }
    };

    const chessboardWrapper =
        <ChessboardWrapper
            boardOrientation={orientation}
            isOnline={!isBotGame}
            botElo={game.bot?.elo}
            isStatic={false}
            onMove={!isBotGame ? handleMove : undefined}
            boardState={!isBotGame ? boardState : game.fen}
            canPlay={!isBotGame ? canPlay : undefined}
        />

    const gamePanel =
        <GameInfos
            socket={!isBotGame ? socketRef.current : undefined}
            game={game}
            playerWhite={playerWhite}
            playerBlack={playerBlack}
            user={user}
            moves={moves}
            chatMessages={!isBotGame ? chatMessages : []}
            isReconnecting={isReconnecting}
        />

    if (!isBotGame && !isReconnecting && waiting) {
        return (
            <GameLayout gamePanel={<GameWaiting value={game.code}/>}/>
        )
    } else {
        return (
            <GameLayout chessBoard={chessboardWrapper} gamePanel={gamePanel} isGameStarted={true}/>
        )
    }

    //TODO Réfléchir sincèrement au gameflow pour éviter les scintillements et avoir une expérience plus fluide
};

export default GameBoardClient;
