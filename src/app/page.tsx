"use client";

import {useEffect} from "react";
import {useSearchParams} from "next/navigation";
import Swal from "sweetalert2";
import {useSession} from "@/lib/auth-client";
import Dashboard from "@/app/components/home/Dashboard";
import DisconnectedHome from "@/app/components/home/DisconnectedHome";
import FullScreenLoader from "@/app/utils/FullScreenLoader";

export default function HomePage() {
    const {data: session, isPending} = useSession();
    const searchParams = useSearchParams();
    useEffect(() => {
        if (searchParams.get("verified") === "1") {
            Swal.fire({
                icon: 'success',
                title: 'Email vérifié !',
                showConfirmButton: false,
                timer: 3500
            });
        }
    }, [searchParams]);

    if (isPending) {
        return <FullScreenLoader/>;
    }

    return (
        <div className="h-full" id={"main-content"}>
            <section className={"h-1/2 flex flex-col items-center justify-center gap-8"}>
                <h1 className="text-4xl font-bold tracking-wider text-center text-primary">Bienvenue sur Checkmate</h1>
                {session?.user ? <Dashboard/> : <DisconnectedHome/>}
            </section>
        </div>
    );
}
