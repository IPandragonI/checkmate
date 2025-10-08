"use client";

import Sidebar from "@/app/components/ui/Sidebar";
import Topbar from "@/app/components/ui/Topbar";
import ThemeProvider from "@/app/components/ui/ThemeProvider";
import {useSession} from "@/lib/auth-client";
import Loader from "@/app/utils/Loader";
import {usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";

function AuthGuard({children}: { children: React.ReactNode }) {
    const {data: session, isPending} = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const isNotAllowed = !isPending && !session?.user && pathname !== "/auth/login-or-register";

    useEffect(() => {
        if (isNotAllowed) {
            router.push("/auth/login-or-register");
        }
    }, [isNotAllowed, router]);

    if (isPending) {
        return <Loader/>;
    }

    if (isNotAllowed) {
        return null;
    }

    return (
        <ThemeProvider>
            <Sidebar>
                <main className="relative min-h-screen overflow-hidden bg-base-100 text-base-content">
                    <Topbar/>
                    {children}
                </main>
            </Sidebar>
        </ThemeProvider>
    );
}

export default function ClientLayout({children}: { children: React.ReactNode }) {
    const pathname = usePathname();

    if (pathname === "/auth/login-or-register") {
        return (
            <main className="relative min-h-screen overflow-hidden bg-base-100 text-base-content">
                {children}
            </main>
        );
    }

    return <AuthGuard>{children}</AuthGuard>;
}
