import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {getUserFromRequest} from "@/app/api/utils/auth";

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user?.id) {
        return NextResponse.json({error: "Non authentifié"}, {status: 401});
    }
    const pref = await prisma.userPreference.findUnique({
        where: {userId: user.id},
    });
    return NextResponse.json({preference: pref});
}

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user?.id) {
        return NextResponse.json({error: "Non authentifié"}, {status: 401});
    }
    const body = await req.json();
    const {theme} = body;
    let pref = await prisma.userPreference.findUnique({
        where: {userId: user.id},
    });
    if (pref) {
        pref = await prisma.userPreference.update({
            where: {userId: user.id},
            data: {theme},
        });
    } else {
        pref = await prisma.userPreference.create({
            data: {userId: user.id, theme},
        });
    }
    return NextResponse.json({preference: pref});
}
