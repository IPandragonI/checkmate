export const timeModes: { key: string; label: string; options: { value: string; label: string }[] }[] = [
    {
        key: "BULLET",
        label: "Bullet",
        options: [
            { value: "1", label: "1 min" },
            { value: "3", label: "3 min" }
        ]
    },
    {
        key: "BLITZ",
        label: "Blitz",
        options: [
            { value: "3", label: "3 min" },
            { value: "5", label: "5 min" }
        ]
    },
    {
        key: "RAPID",
        label: "Rapide",
        options: [
            { value: "10", label: "10 min" },
            { value: "15", label: "15 min" },
            { value: "30", label: "30 min" }
        ]
    },
    {
        key: "CLASSICAL",
        label: "Classique",
        options: [
            { value: "60", label: "60 min" },
            { value: "120", label: "120 min" }
        ]
    }
];

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
    timeMode: string;
    timeLimit: number | null;
    whiteTimeLeft: number | null;
    blackTimeLeft: number | null;
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
    username: string;
    label: string;
    elo: number;
    img: string;
}

export interface ChatMessage {
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
    messageSend: (data: { gameId: string; chatMessage: ChatMessage }) => void;
}

export const WEIGHT: Record<string, number> = {
    q: 9,
    r: 5,
    b: 3,
    n: 3,
    p: 1,
};