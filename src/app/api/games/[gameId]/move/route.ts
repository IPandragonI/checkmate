import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/server/services/gameServices";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ gameId: string }> }
) {
    try {
        const resolved = await params;
        const gameId = resolved.gameId;
        const { move, isGameOver, result, userPlayingId } = await request.json();

        const gameState = await GameService.getGameState(gameId);
        if (!gameState) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        if (!gameState.bot) {
            return NextResponse.json({ error: "Not a bot game" }, { status: 400 });
        }

        await GameService.saveMove(gameId, move);
        if (isGameOver) {
            await GameService.finishGame(gameId, result, userPlayingId);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in bot move:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}