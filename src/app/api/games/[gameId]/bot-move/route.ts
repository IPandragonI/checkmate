import { NextResponse } from "next/server";
import { GameService } from "@/server/services/gameServices";
import { ChessEngine } from "@/app/components/chessBoard/ChessEngine";

export async function POST(request: Request, { params }: { params: { gameId: string } }) {
    try {
        const gameId = await params?.gameId;
        if (!gameId) {
            return NextResponse.json({ error: "Missing gameId in route parameters" }, { status: 400 });
        }

        const gameState = await GameService.getGameState(gameId);
        if (!gameState) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        if (!gameState.bot) {
            return NextResponse.json({ error: "Not a bot game" }, { status: 400 });
        }

        if (gameState.status !== "IN_PROGRESS") {
            return NextResponse.json({ error: "Game not in progress" }, { status: 400 });
        }

        const currentTurn = gameState.currentFen.split(" ")[1];
        const botColor = gameState.playerWhite ? "b" : "w";

        if (currentTurn !== botColor) {
            return NextResponse.json({
                error: "Not bot's turn",
                currentTurn,
                botColor
            }, { status: 400 });
        }

        const chessEngine = new ChessEngine(gameState.currentFen, gameState.bot.elo);
        const botMoveData = chessEngine.makeBotMove();

        if (!botMoveData) {
            return NextResponse.json({ error: "Bot cannot move" }, { status: 500 });
        }

        const botMoveValidation = {
            from: botMoveData.from,
            to: botMoveData.to,
            promotion: botMoveData.promotion,
            moveNumber: gameState.moves.length + 1,
        }

        const botValidation = GameService.validateAndApplyMove(
            gameState.currentFen,
            botMoveValidation
        );

        if (!botValidation.valid) {
            return NextResponse.json({ error: "Bot move invalid" }, { status: 500 });
        }

        const botMove = {
            from: botMoveData.from,
            to: botMoveData.to,
            promotion: botMoveData.promotion,
            fen: botValidation.newFen!,
            capturedPiece: botValidation.capturedPiece,
            moveNumber: gameState.moves.length + 1,
        };

        await GameService.saveMove(gameId, botMove);

        const gameOverCheck = GameService.checkGameOver(botValidation.newFen!);
        if (gameOverCheck.isOver) {
            await GameService.finishGame(gameId, gameOverCheck.result!);
            return NextResponse.json({
                success: true,
                botMove,
                gameOver: true,
                result: gameOverCheck.result,
            });
        }

        return NextResponse.json({
            success: true,
            botMove,
            gameOver: false,
        });
    } catch (error) {
        console.error("Error in bot auto-move:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}