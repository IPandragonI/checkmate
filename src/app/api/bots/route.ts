import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {getUserFromRequest} from "@/app/api/utils/auth";

const prisma = new PrismaClient();

export async function GET() {
    const user = await getUserFromRequest();
    if (!user?.id) {
        return NextResponse.json({error: "Non authentifié"}, {status: 401});
    }

    const bots = await prisma.bot.findMany({
        orderBy: { elo: 'asc' }
    });
    return NextResponse.json(bots);
}

