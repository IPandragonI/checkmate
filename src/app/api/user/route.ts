import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {getUserFromRequest} from "@/app/api/utils/auth";

export async function GET(request: NextRequest) {
    const user = await getUserFromRequest();
    if (!user?.id) {
        return NextResponse.json({error: "Non authentifié"}, {status: 401});
    }

    const gameHistory = await prisma.game.findMany({
        where: {
            OR: [
                {playerWhiteId: user.id},
                {playerBlackId: user.id}
            ]
        },
        include: {
            playerWhite: {
                select: {id: true, name: true, username: true, email: true, elo: true, createdAt: true}
            },
            playerBlack: {
                select: {id: true, name: true, username: true, email: true, elo: true, createdAt: true}
            },
            moves: true
        },
        orderBy: {createdAt: 'desc'},
        take: 10
    });

    return NextResponse.json({user, gameHistory});
}