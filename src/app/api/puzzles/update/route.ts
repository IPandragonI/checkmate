import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/api/utils/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest();
    if (!user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { puzzleId, solved } = body
    if (!puzzleId) return NextResponse.json({ error: "Id du puzzle manquant" }, { status: 400 });

    const p = prisma as any;

    const puzzle = await p.puzzle.findUnique({ where: { id: puzzleId } });
    if (!puzzle) return NextResponse.json({ error: "Puzzle introuvable" }, { status: 404 });

    await p.userPuzzle.upsert({
        where: { userId_puzzleId: { userId: user.id, puzzleId } },
        update: { attempts: { increment: 1 }, solved: solved, lastAttemptAt: new Date() },
        create: { userId: user.id, puzzleId: puzzleId, attempts: 1, solved: solved, lastAttemptAt: new Date() }
    });

    return NextResponse.json({ success: true }, { status: 200 });
}
