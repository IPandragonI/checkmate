"use client";

import {useState} from "react";
import GameJoinField from "@/app/components/field/GameJoinField";
import {useRouter} from "next/navigation";


const GameJoin = () => {
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/games?code=${code}`);
            if (!res.ok) throw new Error("Code invalide ou partie introuvable");
            const data = await res.json();
            if (!data?.id) throw new Error("Code invalide ou partie introuvable");
            router.push(`/games/${data.id}`);
        } catch (err: any) {
            setError(err.message || "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            className="flex flex-col justify-between h-[36rem] p-8 rounded-lg gap-6 border border-gray-200 shadow-lg fieldset bg-base-200 overflow-y-auto"
            onSubmit={handleSubmit}
        >
            <div className={"flex flex-col gap-6"}>
                <div className="text-2xl font-bold mb-1 text-center">Rejoindre une partie</div>
                <GameJoinField code={code} setCode={setCode}/>
                {error && <div className="text-red-500 text-center text-sm mt-2">{error}</div>}
            </div>
            <div>
                <button className="btn btn-primary w-full" type="submit" disabled={loading || !code}>
                    {loading ? <span className="loading loading-spinner loading-sm mr-2"></span> : null}
                    Rejoindre la partie
                </button>
            </div>
        </form>
    );
}

export default GameJoin;