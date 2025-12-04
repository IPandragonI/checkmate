import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/api/utils/auth";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest) {
    const user = await getUserFromRequest();
    if (!user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const p = prisma as any;

    const userPuzzle = await p.userPuzzle.findFirst({
        where: { userId: user.id, solved: false },
        include: { puzzle: true },
        orderBy: { createdAt: 'asc' }
    });

    if (userPuzzle && userPuzzle.puzzle) {
        return NextResponse.json({
            puzzleId: userPuzzle.puzzle.id,
            number: userPuzzle.puzzle.number,
            startFen: userPuzzle.puzzle.startFen,
            difficulty: userPuzzle.puzzle.difficulty,
            solution: userPuzzle.puzzle.solution,
        }, { status: 200 });
    }

    // otherwise return the first puzzle overall (not assigned)
    const puzzle = await p.puzzle.findFirst({ orderBy: { number: 'asc' } });
    if (!puzzle) return NextResponse.json({ error: "Aucun puzzle disponible" }, { status: 404 });

    await p.userPuzzle.create({
        data: { puzzleId: puzzle.id, userId: user.id }
    });

    return NextResponse.json({
        puzzleId: puzzle.id,
        number: puzzle.number,
        startFen: puzzle.startFen,
        difficulty: puzzle.difficulty,
        solution: puzzle.solution,
    }, { status: 200 });
}
