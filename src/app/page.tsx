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
        <section className={`${session?.user ? "h-full" : "h-screen"} flex flex-col items-center justify-center p-4`}>
            {session?.user ? <Dashboard/> : <DisconnectedHome/>}
        </section>
    );
}
