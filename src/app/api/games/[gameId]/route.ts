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
    const { result, winnerId } = data;
    if (!result || !winnerId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    try {
        const updatedGame = await prisma.game.update({
            where: { id: gameId },
            data: {
                result,
                winnerId: winnerId || null,
                finishedAt: new Date(),
                status: "FINISHED"
            },
        });
        return NextResponse.json(updatedGame);
    } catch (error) {
        return NextResponse.json({ error: "Game not found or update failed" }, { status: 404 });
    }
}
