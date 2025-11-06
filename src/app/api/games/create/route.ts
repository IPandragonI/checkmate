import {NextRequest, NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {getUserFromRequest} from "@/app/api/utils/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest();
        if (!user?.id) {
            return NextResponse.json({error: "Non authentifié"}, {status: 401});
        }

        const body = await req.json();
        const {mode, color, timeLimit, timeMode, code, botId} = body;
        let game;
        let playerWhiteId;
        let playerBlackId;

        const timeLimitInMs = parseInt(timeLimit, 10) * 1000;

        if (mode === "bot") {
            if (color === "white") {
                playerWhiteId = user.id;
                playerBlackId = undefined;
            } else if (color === "black") {
                playerWhiteId = undefined;
                playerBlackId = user.id;
            } else {
                if (Math.random() < 0.5) {
                    playerWhiteId = user.id;
                    playerBlackId = undefined;
                } else {
                    playerWhiteId = undefined;
                    playerBlackId = user.id;
                }
            }
            if (!botId) {
                return NextResponse.json({error: "botId requis pour le mode bot"}, {status: 400});
            }

            const bot = await prisma.bot.findUnique({ where: { id: botId } });
            if (!bot) {
                return NextResponse.json({error: "Bot inexistant"}, {status: 400});
            }

            const data: any = {
                code,
                status: "IN_PROGRESS",
                timeLimit: timeLimitInMs,
                timeMode: timeMode?.toUpperCase() || "RAPID",
                whiteTimeLeft: timeLimitInMs,
                blackTimeLeft: timeLimitInMs,
                playerWhiteId: playerWhiteId ?? null,
                playerBlackId: playerBlackId ?? null,
                botId: botId ?? null,
            };
            game = await prisma.game.create({ data });
        } else {
            if (!code) {
                return NextResponse.json({error: "code requis pour le mode online"}, {status: 400});
            }
            if (color === "white") {
                playerWhiteId = user.id;
                playerBlackId = null;
            } else if (color === "black") {
                playerWhiteId = null;
                playerBlackId = user.id;
            } else {
                playerWhiteId = null;
                playerBlackId = null;
            }
            const existingGame = await prisma.game.findFirst({
                where: {code, status: "WAITING"},
            });
            if (existingGame) {
                if (existingGame.playerWhiteId && existingGame.playerBlackId) {
                    return NextResponse.json({error: "Partie complète"}, {status: 400});
                }
                if (existingGame.playerWhiteId === user.id || existingGame.playerBlackId === user.id) {
                    return NextResponse.json({error: "Vous avez déjà rejoint cette partie"}, {status: 400});
                }
                if (!existingGame.playerWhiteId) {
                    playerWhiteId = user.id;
                } else if (!existingGame.playerBlackId) {
                    playerBlackId = user.id;
                }
                game = await prisma.game.update({
                    where: {id: existingGame.id},
                    data: {
                        playerWhiteId,
                        playerBlackId,
                        status: "IN_PROGRESS",
                    },
                });
            } else {
                const data: any = {
                    code,
                    status: "WAITING",
                    timeLimit: timeLimitInMs,
                    timeMode: timeMode?.toUpperCase() || "RAPID",
                    playerWhiteId: playerWhiteId ?? null,
                    playerBlackId: playerBlackId ?? null,
                };
                game = await prisma.game.create({ data });
            }
        }
        return NextResponse.json({gameId: game.id});
    } catch (err: any) {
        return NextResponse.json({error: err.message || "Erreur serveur"}, {status: 500});
    }
}
