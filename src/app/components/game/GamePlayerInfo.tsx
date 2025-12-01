import Image from "next/image";
import {Svg} from "@/app/utils/Svg";
import {WEIGHT} from "@/app/types/game";

interface GamePlayerInfoProps {
    isGameStarted?: boolean
    player?: any
    capturedPieces?: any[]
    weightDiff?: number
    isWhite?: boolean
    playerPlaying?: 'w' | 'b'
    whiteTimeLeft?: number | null
    blackTimeLeft?: number | null
}

function renderCapturedPieces(capturedPieces: any[], isWhite: undefined | boolean) {
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

const GamePlayerInfo = ({
                            isGameStarted = false,
                            player = null,
                            capturedPieces,
                            weightDiff = 0,
                            isWhite = true,
                            playerPlaying,
                            whiteTimeLeft,
                            blackTimeLeft,
                        }: GamePlayerInfoProps) => {
    console.log(playerPlaying)

    const displayedTimeMs = isWhite ? whiteTimeLeft : blackTimeLeft;
    const formatTime = (ms?: number | null) => {
        if (ms == null) return "00:00";
        const mm = Math.floor(ms / 60000);
        const ss = Math.floor((ms % 60000) / 1000);
        return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    };

    const isActive = (playerPlaying === 'w' && isWhite) || (playerPlaying === 'b' && !isWhite);

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
                    <div className="flex flex-row md:flex-col items-start md:items-start">
                        <span className="text-xs md:text-sm font-bold">{player?.username || "Joueur"}</span>
                        <div className="flex items-center">
                            {capturedPieces && capturedPieces.length > 0 && (() => {
                                return renderCapturedPieces(capturedPieces, isWhite);
                            })()}
                            {weightDiff !== 0 && (
                                <span className={`text-xs md:text-sm ml-2 ${weightDiff > 0 && 'text-gray-400'}`}>
                                    {weightDiff > 0 && `+${weightDiff}`}
                                </span>
                            )}
                        </div>
                    </div>
                    {whiteTimeLeft != null && blackTimeLeft != null && (
                        <div className={`${isActive ? 'bg-primary text-white' : 'bg-base-200 text-gray-800'} flex items-center rounded-md px-2 py-1` }>
                            {isActive && <span className="w-2 h-2 rounded-full mr-2" style={{background: 'rgba(255,255,255,0.9)', boxShadow: '0 0 6px rgba(255,255,255,0.6)'}} />}
                            <span className="text-sm font-mono tabular-nums font-bold" style={{minWidth: 56, textAlign: 'center'}}>
                                {formatTime(displayedTimeMs)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
};

export default GamePlayerInfo;