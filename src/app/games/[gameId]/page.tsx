import {PrismaClient} from "@prisma/client";
import React from "react";
import GameBoardClient from "@/app/games/[gameId]/gameBoardClient";

const prisma = new PrismaClient();

export default async function GamePage({params}: { params: { gameId: string } }) {
    params = await params;
    const gameId = params?.gameId;
    if (!gameId) {
        return <div className="p-8 text-center text-red-500">Paramètre de partie manquant</div>;
    }

    const game = await prisma.game.findUnique({
        where: {id: gameId},
        include: {
            playerWhite: {
                select: {id: true, username: true},
            },
            playerBlack: {
                select: {id: true, username: true},
            },
            bot: {
                select: {id: true, name: true},
            },
        },
    });

    if (!game) {
        return <div className="p-8 text-center text-red-500">Partie introuvable</div>;
    }

    return (
        <GameBoardClient game={game}/>
    );
}
