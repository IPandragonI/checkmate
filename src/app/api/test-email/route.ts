import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const { to } = await req.json();
        if (!to || typeof to !== "string" || !to.includes("@")) {
            return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
        }
        await sendEmail({
            to,
            subject: "Test d'envoi d'email Checkmate",
            text: "Ceci est un email de test envoyé depuis Checkmate."
        });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Erreur d'envoi d'email." }, { status: 500 });
    }
}

