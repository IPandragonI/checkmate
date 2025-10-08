"use client";

import BotSelector from "@/app/components/field/BotSelectorField";
import {useEffect, useState} from "react";
import Swal from "sweetalert2";
import {useRouter} from "next/navigation";
import GameModeField from "@/app/components/field/GameModeField";
import StartColorField from "@/app/components/field/StartColorField";
import TimeModeField from "@/app/components/field/TimeModeField";
import GameCodeField from "@/app/components/field/GameCodeField";

function generateAccessCode(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

const GameForm = () => {
    const [mode, setMode] = useState("online");
    const [color, setColor] = useState("random");
    const [timeLimit, setTimeLimit] = useState("10");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [botId, setBotId] = useState("");
    const [timeMode, setTimeMode] = useState("RAPID");
    const router = useRouter();

    useEffect(() => {
        if (mode === "online") {
            setCode(generateAccessCode());
        }
    }, [mode]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = {
                mode,
                color,
                timeLimit,
                timeMode,
                code,
            };
            if (mode === "bot") {
                payload.botId = botId;
            }
            const res = await fetch("/api/games/create", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok || !data.gameId) throw new Error(data.error || "Erreur lors de la création de la partie");
            router.push(`/games/${data.gameId}`);
        } catch (err: any) {
            await Swal.fire({
                icon: "error",
                title: "Erreur",
                text: err.message,
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            className="flex flex-col justify-between h-[36rem] p-8 rounded-lg gap-6 border border-gray-200 shadow-lg fieldset bg-base-200 overflow-y-auto"
            onSubmit={handleSubmit}>
            <div className={"flex flex-col gap-6"}>
                <h1 className="text-2xl text-primary font-bold text-center">Nouvelle partie</h1>
                <GameModeField mode={mode} onClick={() => setMode("online")} onClick1={() => setMode("bot")}/>
                {mode === "bot" && (
                    <>
                        <BotSelector botId={botId} setBotId={setBotId}/>
                        <StartColorField color={color} onClick={() => setColor("white")} onClick1={() => setColor("black")} onClick2={() => setColor("random")}/>
                    </>
                )}
                <TimeModeField value={timeLimit} mode={timeMode} onChange={e => setTimeLimit(e.target.value)}
                               setMode={setTimeMode}/>
                {mode === "online" &&
                    <GameCodeField value={code}/>
                }
            </div>
            <div>
                <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                    {loading ? <span className="loading loading-spinner loading-sm mr-2"></span> : null}
                    Créer la partie
                </button>
            </div>
        </form>
    );
}

export default GameForm;