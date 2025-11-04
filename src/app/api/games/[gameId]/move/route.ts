import {NextRequest, NextResponse} from "next/server";
import { GameService } from "@/server/services/gameServices";
import { Move } from "@/app/types/game";
import {getUserFromRequest} from "@/app/api/utils/auth";

export async function POST(request: NextRequest, context: { params: Promise<{ gameId: string }> }) {
    try {
        const user = await getUserFromRequest();
        if (!user?.id) {
            return NextResponse.json({error: "Non authentifié"}, {status: 401});
        }

        const { gameId } = await context.params;
        if (!gameId) {
            return NextResponse.json({ error: "Paramètre de partie manquant" }, { status: 400 });
        }

        const body = await request.json();
        const move: Move = body.move;

        if (!move || !move.from || !move.to || !move.fen) {
            return NextResponse.json({ error: "Données de mouvement invalides" }, { status: 400 });
        }

        await GameService.saveMove(gameId, move);

        const isGameOver = GameService.checkGameOver(move.fen);
        if (isGameOver.isOver) {
            return NextResponse.json({ message: "Mouvement enregistré. Partie terminée.", gameOver: true });
        }

        return NextResponse.json({ message: "Mouvement enregistré avec succès.", gameOver: false });
    } catch (err: any) {
        console.error("Erreur lors de l'enregistrement du mouvement :", err);
        return NextResponse.json(
            { error: err?.message || "Erreur serveur lors de l'enregistrement du mouvement" },
            { status: 500 }
        );
    }
}
