import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    const bots = await prisma.bot.findMany({
        select: {
            id: true,
            name: true,
            label: true,
            elo: true,
            img: true,
        }
    });
    return NextResponse.json(bots);
}

