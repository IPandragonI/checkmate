import React from "react";
import GameBoardClient from "@/app/games/[gameId]/gameBoardClient";
import {GameService} from "@/server/services/gameServices";

export const dynamic = 'force-dynamic';

export default async function GamePage({params}: { params: { gameId: string } }) {
    params = await params;
    const gameId = params?.gameId;
    if (!gameId) {
        return <div className="p-8 text-center text-red-500">Paramètre de partie manquant</div>;
    }

    const game = await GameService.getGameState(gameId);

    if (!game) {
        return <div className="p-8 text-center text-red-500">Partie introuvable</div>;
    }

    return (
        <GameBoardClient initialGame={game} />
    );
}
