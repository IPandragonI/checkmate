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
export async function PATCH(req: NextRequest) {
    const user = await getUserFromRequest();
    if (!user?.id) {
        return NextResponse.json({error: "Non authentifié"}, {status: 401});
    }

    let body: any;
    try {
        body = await req.json();
    } catch (err) {
        return NextResponse.json({error: 'Payload invalide'}, {status: 400});
    }

    const {name, username, image} = body || {};

    if (username) {
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing && existing.id !== user.id) {
            return NextResponse.json({ error: "Nom d'utilisateur déjà pris" }, { status: 409 });
        }
    }

    try {
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                ...(typeof name === 'string' ? { name } : {}),
                ...(typeof username === 'string' ? { username } : {}),
                ...(typeof image === 'string' ? { image } : {}),
            }
        });

        return NextResponse.json({ user: updated });
    } catch (err: any) {
        console.error('Erreur mise à jour utilisateur:', err);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 });
    }
}
