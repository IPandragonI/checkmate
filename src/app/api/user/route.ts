import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {getUserFromRequest} from "@/app/api/utils/auth";

export async function GET() {
    const user = await getUserFromRequest();
    if (!user?.id) {
        return NextResponse.json({error: "Non authentifié"}, {status: 401});
    }

    const completeUser = await prisma.user.findUnique({
        where: {id: user.id},
    });

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
            bot: true,
            moves: true
        },
        orderBy: {createdAt: 'desc'},
        take: 10
    });

    const ratingHistory = await prisma.ratingHistory.findMany({
        where: {userId: user.id},
        orderBy: {createdAt: 'asc'}
    });

    return NextResponse.json({user: completeUser, gameHistory, ratingHistory});
}