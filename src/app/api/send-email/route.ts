import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import {getUserFromRequest} from "@/app/api/utils/auth";

export async function POST(req: Request) {
    const user = await getUserFromRequest();

    try {
        const { from, subject, text } = await req.json();
        const fromMail = from ?? user?.email

        await sendEmail({
            from: fromMail,
            subject: subject || "Email de test depuis Checkmate",
            text: text || "Ceci est un email de test envoyé depuis l'API Checkmate.",
        });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Erreur d'envoi d'email." }, { status: 500 });
    }
}

