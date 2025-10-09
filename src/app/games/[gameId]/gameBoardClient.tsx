"use client";
import ChessboardWrapper from "@/app/components/chessBoard/ChessboardWrapper";
import {useSession} from "@/lib/auth-client";
import GameInfos from "@/app/components/game/GameInfos";
import {useEffect, useState} from "react";
import {getSocket} from "@/socket";
import {DEFAULT_POSITION} from "chess.js";
import {Chess} from "chess.js";
import Loader from "@/app/utils/Loader";
import GameCodeField from "@/app/components/field/GameCodeField";
import Swal from "sweetalert2";

interface GameBoardClientProps {
    game: any;
}

const GameBoardClient: React.FC<GameBoardClientProps> = ({game}) => {
    const {data: session} = useSession();
    const user = session?.user;

    const [socket, setSocket] = useState<any>(null);
    const [waiting, setWaiting] = useState(true);
    const [playerWhiteId, setPlayerWhiteId] = useState(game.playerWhiteId);
    const [playerBlackId, setPlayerBlackId] = useState(game.playerBlackId);
    const [moveNumber, setMoveNumber] = useState(0);
    const [boardState, setBoardState] = useState(game.fen || DEFAULT_POSITION);
    const [moves, setMoves] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [showMatchAnnouncement, setShowMatchAnnouncement] = useState(false);
    const [matchAnnouncementShown, setMatchAnnouncementShown] = useState(false);

    const isBotGame = !!game.botId;

    useEffect(() => {
        if (!user?.id || isBotGame) return;
        const socket = getSocket(user.id);
        setSocket(socket);
        socket.emit("join", {gameId: game.id, userId: user.id});
        socket.on("move", (move) => {
            setBoardState(move.fen);
            setMoveNumber(move.moveNumber);
            if (showMatchAnnouncement) {
                setShowMatchAnnouncement(false);
                setMatchAnnouncementShown(true);
            }
        });
        socket.on("waiting", () => {
            setWaiting(true);
        });
        socket.on("start", (data) => {
            setWaiting(false);
            setPlayerWhiteId(data.playerWhiteId);
            setPlayerBlackId(data.playerBlackId);
            if (data.moves && Array.isArray(data.moves) && data.moves.length > 0) {
                const chess = new Chess();
                data.moves.forEach((move: any) => {
                    chess.move({
                        from: move.fromSquare,
                        to: move.toSquare,
                        promotion: move.promotion || undefined,
                    });
                });
                setBoardState(chess.fen());
                setMoveNumber(data.moves.length);
                setMoves(data.moves);
                setChatMessages(data.chatMessages || []);
                setShowMatchAnnouncement(false);
                setMatchAnnouncementShown(true);
            } else {
                if (!matchAnnouncementShown) {
                    setShowMatchAnnouncement(true);
                }
            }
        });
        return () => {
            socket.off("move");
            socket.off("waiting");
            socket.off("start");
        };
    }, [game.id, isBotGame, user?.id, showMatchAnnouncement, matchAnnouncementShown]);

    let orientation: "white" | "black" = "white";
    if (user?.id === playerBlackId) orientation = "black";
    if (user?.id === playerWhiteId) orientation = "white";

    const handleMove = (move: any) => {
        if (isBotGame) return;
        const nextMoveNumber = moveNumber + 1;
        setBoardState(move.fen);
        setMoveNumber(nextMoveNumber);
        socket.emit("move", {
            gameId: game.id,
            move: {
                moveNumber: nextMoveNumber,
                fromSquare: move.fromSquare,
                toSquare: move.toSquare,
                promotion: move.promotion || null,
                fen: move.fen,
            },
        });
        console.log(move)
        if (move.isGameOver && move.gameOverReason) {
            console.log("Game over detected")
            console.log(move.gameOverReason)
        }
    };

    const currentTurn = boardState.split(" ")[1] === "w" ? playerWhiteId : playerBlackId;
    const canPlay = user?.id === currentTurn;

    const isReconnecting = game.status === "IN_PROGRESS" && (user?.id === playerWhiteId || user?.id === playerBlackId) && (!socket || waiting);

    useEffect(() => {
        if (!showMatchAnnouncement) return;
        let timerInterval: NodeJS.Timeout | undefined;
        Swal.fire({
            title: "La partie commence !",
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            },
            willClose: () => {
            }
        }).then(() => {
            setShowMatchAnnouncement(false);
            setMatchAnnouncementShown(true);
        });
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [showMatchAnnouncement]);

    if (!isBotGame && waiting && !isReconnecting) {
        return (
            <div
                className="relative z-10 flex flex-row items-start justify-center gap-8 w-full h-screen overflow-hidden px-14 pt-20 pb-8">
                <div className="hidden md:flex items-center justify-center w-3/5 h-full">
                    <div
                        className="w-full h-full max-w-[32rem] max-h-[32rem] aspect-square shadow-lg rounded-lg overflow-hidden flex items-center justify-center mx-auto p-2 bg-base-200 border border-gray-200">
                        <ChessboardWrapper/>
                    </div>
                </div>
                <div className="w-full md:w-2/5">
                    <div className="flex flex-col h-[36rem] p-8 rounded-lg gap-6 border border-gray-200 shadow-lg fieldset bg-base-200 overflow-y-auto">
                        <div className="text-2xl font-semibold mb-4">En attente d&#39;un adversaire...</div>
                        <GameCodeField value={game.code}/>
                        <Loader />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative z-10 flex flex-row items-start justify-center gap-8 w-full h-screen overflow-hidden px-14 pt-20 pb-8">
            <div className="hidden md:flex items-center justify-center w-3/5 h-full">
                <div
                    className="w-full h-full max-w-[32rem] max-h-[32rem] aspect-square shadow-lg rounded-lg overflow-hidden flex items-center justify-center mx-auto p-2 bg-base-200 border border-gray-200">
                    <ChessboardWrapper
                        boardOrientation={orientation}
                        isOnline={!isBotGame}
                        botElo={game.bot?.elo}
                        isStatic={false}
                        onMove={!isBotGame ? handleMove : undefined}
                        boardState={!isBotGame ? boardState : game.fen}
                        canPlay={!isBotGame ? canPlay : undefined}
                    />
                </div>
            </div>
            <div className="w-full md:w-2/5">
                <GameInfos
                    socket={!isBotGame ? socket : undefined}
                    game={game}
                    user={user}
                    moves={moves}
                    chatMessages={!isBotGame ? chatMessages : []}
                    isReconnecting={isReconnecting}
                />
            </div>
        </div>
    );
};

export default GameBoardClient;
