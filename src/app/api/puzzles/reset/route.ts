import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/api/utils/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest();
    if (!user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    await prisma.userPuzzle.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({ success: true }, { status: 200 });
}
