import Image from "next/image";
import {Svg} from "@/app/utils/Svg";

interface GamePlayerInfoProps {
    isGameStarted?: boolean;
    player?: any;
    capturedPieces?: any[];
    isWhite?: boolean;
}

function renderCapturedPieces(capturedPieces: any[], isWhite: undefined | boolean) {
    const WEIGHT: Record<string, number> = {
        q: 9,
        r: 5,
        b: 3,
        n: 3,
        p: 1,
    };

    const pieces: string[] = capturedPieces
        .map((p: any) => (typeof p === 'string' ? p.toLowerCase() : String(p).toLowerCase()))
        .filter(Boolean);

    const groups: Record<string, number> = {};
    for (const p of pieces) groups[p] = (groups[p] || 0) + 1;

    const types = Object.keys(groups).sort((a, b) => {
        const wa = WEIGHT[a] ?? 0;
        const wb = WEIGHT[b] ?? 0;
        if (wb !== wa) return wb - wa;
        return a.localeCompare(b);
    });

    return types.map((type) => {
        const count = groups[type];
        return (
            <div key={type} className="flex items-center">
                {Array.from({length: count}).map((_, i) => (
                    <Svg
                        key={`${type}-${i}`}
                        src={`/pieces/${isWhite ? 'b' : 'w'}${type.toUpperCase()}.svg`}
                        alt={type}
                        width={22}
                        height={22}
                        style={{
                            position: 'relative',
                            marginLeft: i === 0 ? 0 : -14,
                            zIndex: i,
                        }}
                    />
                ))}
            </div>
        );
    });
}

const GamePlayerInfo = ({isGameStarted = false, player = null, capturedPieces, isWhite = true}: GamePlayerInfoProps) => {
    return (
        <div className={`${isGameStarted ? "" : "hidden"} w-full flex items-center justify-center`}>
            <div className="w-full p-2 flex items-center gap-4">
                {player?.image ? (
                    <Image src={player.image} alt={player.username} className="w-8 h-8 rounded-full object-cover"/>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xl text-gray-400">?</span>
                    </div>
                )}
                <div className="flex items-center justify-between w-full">
                    <span className="text-xs md:text-sm font-bold">{player?.username || "Joueur"}</span>
                    <div className="flex items-center">
                        {capturedPieces && capturedPieces.length > 0 && (() => {
                            return renderCapturedPieces(capturedPieces, isWhite);
                        })()}
                     </div>
                </div>
            </div>
        </div>
    )
};

export default GamePlayerInfo;