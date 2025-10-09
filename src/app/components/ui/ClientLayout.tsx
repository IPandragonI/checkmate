"use client";

import Sidebar from "@/app/components/ui/Sidebar";
import Topbar from "@/app/components/ui/Topbar";
import ThemeProvider from "@/app/components/ui/ThemeProvider";
import {useSession} from "@/lib/auth-client";
import FullScreenLoader from "@/app/utils/FullScreenLoader";
import {usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";

function AuthGuard({children}: { children: React.ReactNode }) {
    const {data: session, isPending} = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const isNotAllowed = !isPending && !session?.user && pathname !== "/auth/login-or-register" && pathname !== "/";

    useEffect(() => {
        if (isNotAllowed) {
            router.push("/");
        }
    }, [isNotAllowed, router]);

    if (isPending) {
        return <FullScreenLoader/>;
    }

    if (isNotAllowed) {
        return null;
    }

    if (!isPending && !session?.user) {
        return (
            <ThemeProvider>
                <main className="min-h-screen w-full overflow-hidden bg-base-100 text-base-content">
                    {children}
                </main>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <Sidebar>
                <main className="min-h-screen w-full overflow-hidden bg-base-100 text-base-content">
                    <Topbar/>
                    {children}
                </main>
            </Sidebar>
        </ThemeProvider>
    );
}

export default function ClientLayout({children}: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}
