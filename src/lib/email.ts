import {Resend} from "resend";

export async function sendEmail({from, to, subject, text}: {from?: string; to?: string; subject: string; text: string }) {
    const fromMail = from ?? (process.env.SMTP_FROM || process.env.SMTP_USER);
    const toMail = to ?? process.env.SMTP_TO;
    const resend = new Resend(process.env.SMTP_PASS!);

    console.log("sendEmail called with:", { fromMail, toMail, subject, text });
    await resend.emails.send({
        from: "Checkmate <" + fromMail + ">",
        to: toMail!,
        subject,
        text,
    });
}