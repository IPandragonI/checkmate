import React from "react";

interface Move {
    fromSquare: string;
    toSquare: string;
    promotion?: string;
    san?: string;
}

interface MoveListProps {
    moves: Move[];
}

const MoveList: React.FC<MoveListProps> = ({ moves }) => {
    const pairs = [];
    for (let i = 0; i < moves.length; i += 2) {
        pairs.push({
            number: Math.floor(i / 2) + 1,
            white: moves[i]?.san || `${moves[i]?.toSquare}`,
            black: moves[i + 1]?.san || (moves[i + 1] ? `${moves[i + 1].toSquare}` : "")
        });
    }

    return (
        <div className="grid grid-cols-3 gap-2 text-sm max-h-full overflow-y-auto justify-items-start">
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
        </div>
    );
};

export default MoveList;

