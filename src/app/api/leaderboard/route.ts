import {NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {getUserFromRequest} from '@/app/api/utils/auth';

export async function GET() {
    const user = await getUserFromRequest();
    if (!user?.id) {
        return NextResponse.json({error: 'Non authentifié'}, {status: 401});
    }

    const completeUser = await prisma.user.findUnique({
        where: {id: user.id},
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
            elo: true,
            image: true,
            createdAt: true,
        },
    });

    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            username: true,
            elo: true,
            image: true,
            createdAt: true,
        },
        orderBy: {elo: 'desc'},
    });

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const gamesTodayCount = await prisma.game.count({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    const gamesInProgressCount = await prisma.game.count({
        where: {status: 'IN_PROGRESS'},
    });

    return NextResponse.json({
        user: completeUser,
        users,
        counts: {
            gamesToday: gamesTodayCount,
            inProgress: gamesInProgressCount,
        },
    });
}

