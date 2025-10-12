import Image from "next/image";

interface GamePlayerInfoProps {
    isGameStarted?: boolean;
    player?: any;
    piecesTaken?: any[];
}

const GamePlayerInfo = ({isGameStarted = false, player = null, piecesTaken = []}: GamePlayerInfoProps) => {
    return (
        <div className={`${isGameStarted ? "" : "hidden"} w-full flex items-center justify-center`}>
            <div className="w-full p-2 flex items-center gap-4">
                {player?.image ? (
                    <Image src={player.image} alt={player.username} className="w-8 h-8 rounded-full object-cover"/>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-4xl text-gray-400">?</span>
                    </div>
                )}
                <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-bold">{player?.username || "Joueur"}</span>
                </div>
            </div>
        </div>
    )
};

export default GamePlayerInfo;