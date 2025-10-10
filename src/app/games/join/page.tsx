import GameJoin from "@/app/components/game/panel/GameJoin";
import GameLayout from "@/app/components/game/GameLayout";

export default function CreateGamePage() {
    return (
        <GameLayout gamePanel={<GameJoin/>}/>
    );
}
