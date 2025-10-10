"use client";
import GameLayout from "@/app/components/game/GameLayout";
import GameForm from "@/app/components/game/panel/GameForm";

export default function CreateGamePage() {
    return (
        <GameLayout gamePanel={<GameForm/>}/>
    );
}
