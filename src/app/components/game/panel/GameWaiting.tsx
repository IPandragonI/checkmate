import GameCodeField from "@/app/components/field/GameCodeField";
import Loader from "@/app/utils/Loader";
import {Component} from "react";

function GameWaiting({value}: { value: string }) {
    return (
        <>
            <div className="text-2xl font-semibold mb-4">En attente d&#39;un adversaire...</div>
            <GameCodeField value={value}/>
            <Loader/>
        </>
    );
}

export default GameWaiting;
