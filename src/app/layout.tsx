import "./globals.css";
import ClientLayout from "@/app/components/ui/ClientLayout";

export default function Layout({children}: { children: React.ReactNode }) {
    return (
        <html lang="fr">
        <head>
            <title>Checkmate</title>
            <meta name="description" content="Application de jeu d'échecs"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <link rel="icon" href="/favicon.ico"/>
        </head>
        <body>
        <ClientLayout>{children}</ClientLayout>
        </body>
        </html>
    );
}
