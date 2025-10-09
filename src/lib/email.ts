import nodemailer from "nodemailer";

export async function sendEmail({to, subject, text}: { to: string; subject: string; text: string }) {
    console.log("sendEmail called with:", { to, subject, text });
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        ...(process.env.SMTP_USER && process.env.SMTP_PASS
                ? {
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    }
                }
                : {}
        ),
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            text,
        });
        console.log("Email envoyé:", info);
        return info;
    } catch (err) {
        console.error("Erreur lors de l'envoi de l'email:", err);
        throw err;
    }
}
