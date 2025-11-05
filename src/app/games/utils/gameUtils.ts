import {Chess} from "chess.js";
import {GameResult} from "@prisma/client";
import Swal from "sweetalert2";

export function getGameResult(chess: Chess): GameResult | null {
    const winner = chess.turn() === 'w' ? 'black' : 'white';
    if (chess.isCheckmate()) return winner === 'white' ? GameResult.WHITE_WIN : GameResult.BLACK_WIN;
    if (chess.isDraw()) return GameResult.DRAW;
    if (chess.isDrawByFiftyMoves()) return GameResult.DRAW;
    if (chess.isStalemate()) return GameResult.STALEMATE;
    if (chess.isThreefoldRepetition()) return GameResult.REPETITION;
    if (chess.isInsufficientMaterial()) return GameResult.STALEMATE;
    return null;
}

export function getGameResultString(result: GameResult): string {
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

export interface GameOverHandlerProps {
    chess: Chess;
    playerWhite: any;
    playerBlack: any;
    router: any;
}

export async function handleGameOver({chess, playerWhite, playerBlack, router}: GameOverHandlerProps) {
    const result = getGameResult(chess) || GameResult.DRAW;
    const resultString = getGameResultString(result);
    const winner = chess.turn() === 'w' ? playerBlack : playerWhite;

    setTimeout(async () => {
        await Swal.fire({
            title: 'Partie terminée !',
            html: `<b>Résultat :</b> ${resultString}<br/><br/><b>Gagnant :</b> ${result === GameResult.DRAW ? 'Nulle' : winner?.username || 'Inconnu'}`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Rejouer',
            cancelButtonText: 'Retour au menu',
        }).then((res) => {
            if (res.isConfirmed) {
                router.push("/create");
            } else if (res.isDismissed) {
                router.push("/");
            }
        });
    }, 500);
}