"use client";
import ChessboardWrapper from "@/app/components/chessBoard/ChessboardWrapper";
import {useSession} from "@/lib/auth-client";
import GameInfos from "@/app/components/game/GameInfos";
import {useEffect, useState, useRef} from "react";
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
    const [playerWhite, setPlayerWhite] = useState(game.playerWhite);
    const [playerBlack, setPlayerBlack] = useState(game.playerBlack);
    const [moveNumber, setMoveNumber] = useState(0);
    const [boardState, setBoardState] = useState(game.fen || DEFAULT_POSITION);
    const [moves, setMoves] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [showMatchAnnouncement, setShowMatchAnnouncement] = useState(false);
    const [matchAnnouncementShown, setMatchAnnouncementShown] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gameOverReason, setGameOverReason] = useState<string | null>(null);

    const isBotGame = !!game.botId;
    const chess = useRef(new Chess(game.fen || DEFAULT_POSITION));

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
            setPlayerWhite(data.playerWhite);
            setPlayerBlack(data.playerBlack);

            chess.current.load(data.fen || DEFAULT_POSITION);
            if (data.moves && Array.isArray(data.moves) && data.moves.length > 0) {
                chess.current.reset();
                data.moves.forEach((move: any) => {
                    chess.current.move({
                        from: move.fromSquare,
                        to: move.toSquare,
                        promotion: move.promotion || undefined,
                    });
                });
                setBoardState(chess.current.fen());
                setMoveNumber(data.moves.length);
                setMoves(data.moves);
                setChatMessages(data.chatMessages || []);
                setShowMatchAnnouncement(false);
                setMatchAnnouncementShown(true);

                if (chess.current.isGameOver()) {
                    setGameOver(true);
                    setGameOverReason(chess.current.isGameOver() ? "Échec et mat" : chess.current.isDraw() ? "Partie nulle" : chess.current.isStalemate() ? "Pat" : chess.current.isThreefoldRepetition() ? "Répétition triple" : chess.current.isInsufficientMaterial() ? "Matériel insuffisant" : "Fin de partie");
                } else {
                    setGameOver(false);
                    setGameOverReason(null);
                }
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

    useEffect(() => {
        if (game.fen) {
            chess.current.load(game.fen);
        }
    }, [game.fen]);

    let orientation: "white" | "black" = "white";
    if (user?.id === playerBlack?.id) orientation = "black";
    if (user?.id === playerWhite?.id) orientation = "white";

    const handleMove = (move: any) => {
        if (isBotGame) return;
        const nextMoveNumber = moveNumber + 1;
        chess.current.move({
            from: move.fromSquare,
            to: move.toSquare,
            promotion: move.promotion || undefined,
        });
        setBoardState(chess.current.fen());
        setMoveNumber(nextMoveNumber);
        socket.emit("move", {
            gameId: game.id,
            move: {
                moveNumber: nextMoveNumber,
                fromSquare: move.fromSquare,
                toSquare: move.toSquare,
                promotion: move.promotion || null,
                fen: chess.current.fen(),
            },
        });

        if (chess.current.isGameOver()) {
            console.log('Game over detected');
            setGameOver(true);
            setGameOverReason(chess.current.isGameOver() ? "Échec et mat" : chess.current.isDraw() ? "Partie nulle" : chess.current.isStalemate() ? "Pat" : chess.current.isThreefoldRepetition() ? "Répétition triple" : chess.current.isInsufficientMaterial() ? "Matériel insuffisant" : "Fin de partie");
        } else {
            setGameOver(false);
            setGameOverReason(null);
        }
    };

    const currentTurn = boardState.split(" ")[1] === "w" ? playerWhite?.id : playerBlack?.id;
    const canPlay = user?.id === currentTurn;

    const isReconnecting = game.status === "IN_PROGRESS" && (user?.id === playerWhite?.id || user?.id === playerBlack?.id) && (!socket || waiting);

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
            setMatchAnnouncementShown(true);
        });
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [playerBlack?.username, playerWhite?.username, showMatchAnnouncement]);

    if (!isBotGame && waiting && !isReconnecting) {
        return (
            <div
                className="relative z-10 flex flex-row items-start justify-center gap-8 w-full h-screen overflow-hidden px-14 pt-20 pb-8">
                <div className="hidden md:flex items-center justify-center w-3/5 h-full">
                    <div
                        className="w-full h-full max-w-[32rem] max-h-[32rem] aspect-square shadow-lg rounded-lg overflow-hidden flex items-center justify-center mx-auto p-2 bg-base-200 border border-gray-200">
                        <ChessboardWrapper />
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
                    playerWhite={playerWhite}
                    playerBlack={playerBlack}
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
