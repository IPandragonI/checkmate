import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/api/utils/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest();
    if (!user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { puzzleId, moves } = body as { puzzleId?: string; moves?: any[] };
    if (!puzzleId || !Array.isArray(moves)) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const p = prisma as any;

    const puzzle = await p.puzzle.findUnique({ where: { id: puzzleId } });
    if (!puzzle) return NextResponse.json({ error: "Puzzle introuvable" }, { status: 404 });

    // solution stored as JSON in puzzle.solution, compare moves arrays simply
    let solution: any;
    try { solution = typeof puzzle.solution === 'string' ? JSON.parse(puzzle.solution) : puzzle.solution; } catch (e) { solution = puzzle.solution; }

    const isCorrect = JSON.stringify(solution) === JSON.stringify(moves);

    await p.userPuzzle.upsert({
        where: { userId_puzzleId: { userId: user.id, puzzleId: puzzle.id } },
        update: {
            attempts: { increment: 1 },
            solved: isCorrect,
            lastAttemptAt: new Date()
        },
        create: {
            userId: user.id,
            puzzleId: puzzle.id,
            attempts: 1,
            solved: isCorrect,
            lastAttemptAt: new Date()
        }
    });

    return NextResponse.json({ success: true, correct: isCorrect }, { status: 200 });
}
