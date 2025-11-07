import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {getUserFromRequest} from "@/app/api/utils/auth";

export async function PUT(request: NextRequest, context: { params: Promise<{ gameId: string }> }) {
    const user = await getUserFromRequest();
    if (!user?.id) {
        return NextResponse.json({error: "Non authentifié"}, {status: 401});
    }

    const { gameId } = await context.params;
    let data;
    try {
        data = await request.json();
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { result, moves, chatMessages, finishedAt } = data;
    if (!result || !moves || !finishedAt) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    try {
        const updatedGame = await prisma.game.update({
            where: { id: gameId },
            data: {
                result,
                moves,
                messages: chatMessages,
                finishedAt: new Date(finishedAt),
                status: "FINISHED"
            },
        });
        return NextResponse.json(updatedGame);
    } catch (error) {
        return NextResponse.json({ error: "Game not found or update failed" }, { status: 404 });
    }
}
