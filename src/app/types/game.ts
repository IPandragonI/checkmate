export interface Move {
    from: string;
    to: string;
    promotion?: string;
    capturedPiece?: string;
    fen: string;
    moveNumber: number;
    timestamp?: Date;
}

export interface CapturedPieces {
    white: string[];
    black: string[];
}

export interface GameState {
    id: string;
    code: string;
    status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
    result?: string;
    currentFen: string;
    moves: Move[];
    capturedPieces: CapturedPieces;
    playerWhite?: Player;
    playerBlack?: Player;
    bot?: Bot;
    chatMessages?: ChatMessage[];
}

export interface Player {
    id: string;
    username: string;
    displayUsername?: string;
    name: string;
    image?: string;
    elo: number;
}

export interface Bot {
    id: string;
    name: string;
    label: string;
    elo: number;
    img: string;
}

export interface ChatMessage {
    id: string;
    userId: string;
    message: string;
    sentAt: Date;
}

export interface ServerToClientEvents {
    waiting: () => void;
    start: (data: {
        playerWhite: Player;
        playerBlack: Player;
        gameState: GameState;
    }) => void;
    move: (move: Move) => void;
    gameOver: (data: { result: string; finalFen: string }) => void;
    messageReceived: (msg: ChatMessage) => void;
    error: (message: string) => void;
}

export interface ClientToServerEvents {
    join: (data: { gameId: string; userId: string }) => void;
    move: (data: { gameId: string; move: Move }) => void;
    messageSend: (data: { gameId: string; msg: ChatMessage }) => void;
}