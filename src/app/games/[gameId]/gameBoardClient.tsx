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
import {GameResult} from "@prisma/client";

function getGameResult(chess: Chess): GameResult | null {
    const winner = chess.turn() === 'w' ? 'black' : 'white';
    if (chess.isCheckmate()) return winner === 'white' ? GameResult.WHITE_WIN : GameResult.BLACK_WIN;
    if (chess.isDraw()) return GameResult.DRAW;
    if (chess.isDrawByFiftyMoves()) return GameResult.DRAW;
    if (chess.isStalemate()) return GameResult.STALEMATE;
    if (chess.isThreefoldRepetition()) return GameResult.REPETITION;
    if (chess.isInsufficientMaterial()) return GameResult.STALEMATE;
    return null;
}

function getGameResultString(result: GameResult): string {
    switch (result) {
        case GameResult.WHITE_WIN:
            return "Victoire des Blancs";
        case GameResult.BLACK_WIN:
            return "Victoire des Noirs";
        case GameResult.STALEMATE:
            return "Pat";
        case GameResult.REPETITION:
            return "Répétition";
        default:
            return "Nulle";
    }
}

interface GameOverHandlerProps {
    chess: Chess;
    playerWhite: any;
    playerBlack: any;
    moves: any[];
    chatMessages: any[];
    gameId: string;
    router: any;
}

interface GameBoardClientProps {
    game: any;
}

const GameBoardClient: React.FC<GameBoardClientProps> = ({game}) => {
    const {data: session} = useSession();
    const user = session?.user;
    const router = useRouter();

    const [socket, setSocket] = useState<any>(null);
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

    useEffect(() => {
        if (!user?.id || isBotGame) return;
        const socket = getSocket(user.id);
        setSocket(socket);
        socket.emit("join", {gameId: game.id, userId: user.id});
        socket.on("move", (move) => {
            setBoardState(move.fen);
            setMoveNumber(move.moveNumber);
            chess.current.move(move);
            setMoves((prevMoves) => [...prevMoves, move]);
        });
        socket.on("gameOver", async (data) => {
            const resultString = getGameResultString(data.result);
            const winner = data.result === "WHITE_WIN" ? playerWhite : data.result === "BLACK_WIN" ? playerBlack : null;
            setTimeout(async () => {
                await Swal.fire({
                    title: 'Partie terminée !',
                    html: `<b>Résultat :</b> ${resultString}<br/><br/><b>Gagnant :</b> ${data.result === "DRAW" ? 'Nulle' : winner?.username || 'Inconnu'}`,
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Rejouer',
                    cancelButtonText: 'Retour au menu',
                }).then((res) => {
                    if (res.isConfirmed) {
                        router.push("create");
                    } else if (res.isDismissed) {
                        router.push("/");
                    }
                });
            }, 500);
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
                        from: move.from || move.from,
                        to: move.to || move.to,
                        promotion: move.promotion || undefined,
                    });
                });
                setBoardState(chess.current.fen());
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
            socket.off("gameOver");
            socket.off("waiting");
            socket.off("start");
        };
    }, [game.id, isBotGame, user?.id, showMatchAnnouncement, matchAnnouncementShown, playerWhite, playerBlack, moves, chatMessages, router]);

    useEffect(() => {
        if (game.fen) {
            chess.current.load(game.fen);
        }
    }, [game.fen]);

    let orientation: "white" | "black" = "white";
    if (user?.id === playerBlack?.id) orientation = "black";
    if (user?.id === playerWhite?.id) orientation = "white";

    const handleMove = (move: Move) => {
        if (isBotGame) return;
        const nextMoveNumber = moveNumber + 1;
        socket.emit("move", {
            gameId: game.id,
            move: {
                ...move,
                moveNumber: nextMoveNumber,
            },
        });
    };

    const currentTurn = boardState.split(" ")[1] === "w" ? playerWhite?.id : playerBlack?.id;
    const canPlay = user?.id === currentTurn;

    const isReconnecting = game.status === "IN_PROGRESS" && (user?.id === playerWhite?.id || user?.id === playerBlack?.id) && (!socket || waiting) && !isBotGame;

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
            socket={!isBotGame ? socket : undefined}
            game={game}
            playerWhite={playerWhite}
            playerBlack={playerBlack}
            user={user}
            moves={moves}
            chatMessages={!isBotGame ? chatMessages : []}
            isReconnecting={isReconnecting}
        />

    if (!isBotGame && waiting && !isReconnecting) {
        return (
            <GameLayout gamePanel={<GameWaiting value={game.code}/>}/>
        )
    } else {
        return (
            <GameLayout chessBoard={chessboardWrapper} gamePanel={gamePanel} isGameStarted={true}/>
        )
    }
};

export default GameBoardClient;
