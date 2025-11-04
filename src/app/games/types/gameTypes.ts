import {Chess} from "chess.js";

export interface GameOverHandlerProps {
    chess: Chess;
    playerWhite: any;
    playerBlack: any;
    moves: any[];
    chatMessages: any[];
    gameId: string;
    router: any;
}

