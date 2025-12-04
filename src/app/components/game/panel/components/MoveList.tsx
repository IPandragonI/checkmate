import React, { useEffect, useRef } from "react";
import {Move} from "@/app/types/game";
interface MoveListProps {
    moves: Move[];
}

const MoveList: React.FC<MoveListProps> = ({ moves }) => {
    const pairs = [];
    for (let i = 0; i < moves.length; i += 2) {
        pairs.push({
            number: Math.floor(i / 2) + 1,
            white: `${moves[i]?.to}`,
            black: (moves[i + 1] ? `${moves[i + 1].to}` : "")
        });
    }

    // ref to the scrollable container (kept for potential future use)
    const containerRef = useRef<HTMLDivElement | null>(null);
    // sentinel ref at the bottom — we'll scroll this into view
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // effect: scroll to bottom every time the moves array changes
    useEffect(() => {
        // prefer scrollIntoView on the sentinel — it'll find the nearest scrollable ancestor
        if (bottomRef.current) {
            try {
                bottomRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
            } catch (e) {
                // fallback: set container scrollTop
                const el = containerRef.current;
                if (el) el.scrollTop = el.scrollHeight;
            }
        }
    }, [moves]);

    return (
        <div ref={containerRef} className="grid grid-cols-3 gap-2 text-sm max-h-full overflow-y-auto justify-items-start">
            <div className="font-bold">#</div>
            <div className="font-bold">Blanc</div>
            <div className="font-bold">Noir</div>
            {pairs.map((pair) => (
                <React.Fragment key={pair.number}>
                    <div className="text-center text-gray-500">{pair.number}</div>
                    <div className="text-center">{pair.white}</div>
                    <div className="text-center">{pair.black}</div>
                </React.Fragment>
            ))}
            {/* sentinel pour s'assurer que le scroll va bien au bas */}
            <div ref={bottomRef} style={{height: 0, width: 0}} aria-hidden />
        </div>
    );
};

export default MoveList;
