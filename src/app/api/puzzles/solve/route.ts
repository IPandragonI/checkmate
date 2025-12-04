import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/api/utils/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest();
    if (!user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { puzzleId } = body as { puzzleId?: string; };
    if (!puzzleId) return NextResponse.json({ error: "Id du puzzle manquant" }, { status: 400 });

    const p = prisma as any;

    const puzzle = await p.puzzle.findUnique({ where: { id: puzzleId } });
    if (!puzzle) return NextResponse.json({ error: "Puzzle introuvable" }, { status: 404 });

    await p.userPuzzle.update({
        where: { userId: user.id, puzzleId: puzzleId },
        data: { solved: true, solvedAt: new Date() }
    });

    const nextPuzzle = await p.puzzle.findFirst({
        where: {
            id: { notIn: p.userPuzzle.findMany({
                where: { userId: user.id, solved: true },
                select: { puzzleId: true }
            }).then((ups: any[]) => ups.map(up => up.puzzleId)) }
        },
        orderBy: { number: 'asc' }
    });

    if (nextPuzzle) {
        await p.userPuzzle.create({
            data: { puzzleId: nextPuzzle.id, userId: user.id }
        });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
