import {NextRequest} from "next/server";
import prisma from "@/lib/prisma";

export async function getUserFromRequest(req: NextRequest) {
    const cookie = req.cookies.get("better-auth.session_token");
    if (!cookie) return null;
    const token = cookie.value.split(".")[0];
    const session = await prisma.session.findUnique({
        where: { token: token },
        include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) return null;
    return session.user;
}

