import GameCodeField from "@/app/components/field/GameCodeField";
import Loader from "@/app/utils/Loader";

function GameWaiting({value}: { value: string }) {
    return (
        <div>
            <div className="text-2xl font-semibold mb-4">En attente d&#39;un adversaire...</div>
            <GameCodeField value={value}/>
            <Loader/>
        </div>
    );
}

export default GameWaiting;
