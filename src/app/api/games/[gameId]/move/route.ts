import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/server/services/gameServices";
import { ChessEngine } from "@/app/components/chessBoard/ChessEngine";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ gameId: string }> }
) {
    try {
        const resolved = await params;
        const gameId = resolved.gameId;
        const { move } = await request.json();

        const gameState = await GameService.getGameState(gameId);
        if (!gameState) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        if (!gameState.bot) {
            return NextResponse.json({ error: "Not a bot game" }, { status: 400 });
        }

        const validation = GameService.validateAndApplyMove(
            gameState.currentFen,
            move
        );

        if (!validation.valid) {
            return NextResponse.json({ error: "Invalid move" }, { status: 400 });
        }

        const completeMove = {
            ...move,
            fen: validation.newFen!,
            capturedPiece: validation.capturedPiece,
        };

        await GameService.saveMove(gameId, completeMove);

        const gameOverCheck = GameService.checkGameOver(validation.newFen!);
        if (gameOverCheck.isOver) {
            await GameService.finishGame(gameId, gameOverCheck.result!);
            return NextResponse.json({
                success: true,
                gameOver: true,
                result: gameOverCheck.result,
            });
        }

        const chessEngine = new ChessEngine(validation.newFen!, gameState.bot.elo);
        const botMoveData = chessEngine.makeBotMove();

        if (!botMoveData) {
            return NextResponse.json({
                success: true,
                gameOver: false,
            });
        }

        const moveToValidate = {
            ...botMoveData,
            fen: "",
            capturedPiece: undefined,
            moveNumber: completeMove.moveNumber + 1,
        }

        const botValidation = GameService.validateAndApplyMove(
            validation.newFen!,
            moveToValidate
        );

        if (!botValidation.valid) {
            return NextResponse.json({ error: "Bot move invalid" }, { status: 500 });
        }

        const botMove = {
            ...botMoveData,
            fen: botValidation.newFen!,
            capturedPiece: botValidation.capturedPiece,
            moveNumber: move.moveNumber + 1,
        };

        await GameService.saveMove(gameId, botMove);

        const botGameOverCheck = GameService.checkGameOver(botValidation.newFen!);
        if (botGameOverCheck.isOver) {
            await GameService.finishGame(gameId, botGameOverCheck.result!);
            return NextResponse.json({
                success: true,
                botMove,
                gameOver: true,
                result: botGameOverCheck.result,
            });
        }

        return NextResponse.json({
            success: true,
            botMove,
            gameOver: false,
        });
    } catch (error) {
        console.error("Error in bot move:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}