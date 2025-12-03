import {Resend} from "resend";

export async function sendEmail({to, subject, text}: { to: string; subject: string; text: string }) {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const resend = new Resend(process.env.SMTP_PASS!);

    console.log("sendEmail called with:", { from, to, subject, text });
    await resend.emails.send({
        from: "Checkmate <" + from + ">",
        to,
        subject,
        text,
    });
}