import {NextRequest, NextResponse} from "next/server";
import {getUserFromRequest} from "@/app/api/utils/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest();
    if (!user?.id) {
        return NextResponse.json({error: "Non authentifié"}, {status: 401});
    }

    const {searchParams} = new URL(req.url);
    const code = searchParams.get("code");
    if (!code) {
        return new Response(JSON.stringify({error: "Code requis"}), {status: 400});
    }
    const res = await prisma.game.findFirst({
        where: {code},
        include: {
            playerWhite: {
                select: {id: true, name: true},
            },
            playerBlack: {
                select: {id: true, name: true},
            },
            bot: true,
        },
    });
    if (!res) {
        return new Response(JSON.stringify({error: "Partie introuvable"}), {status: 404});
    }
    return NextResponse.json(res, {status: 200});
}