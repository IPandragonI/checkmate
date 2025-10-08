"use client";

import {useEffect} from "react";
import {useSearchParams} from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

export default function HomePage() {
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

    return (
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8 p-10 min-h-screen" id={"main-content"}>
            <h1 className="text-4xl font-bold text-center">Bienvenue sur Checkmate</h1>
            <Link className="btn btn-primary btn-lg btn-wide" href={"/games/create"}>Créer une partie</Link>
            <Link className="btn btn-secondary btn-lg btn-wide" href={"/games/join"}>Rejoindre une partie</Link>
        </div>
    );
}
