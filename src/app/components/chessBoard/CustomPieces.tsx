import React from "react";
import Svg from "@/app/utils/Svg";

export function getCustomPieces(squareSize: number) {
    const pieceNames = [
        'wP', 'wN', 'wB', 'wR', 'wQ', 'wK',
        'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'
    ];
    const components: Record<string, () => React.JSX.Element> = {};
    pieceNames.forEach(piece => {
        components[piece] = () => (
            <div style={{
                width: squareSize,
                height: squareSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Svg src={`/pieces/${piece}.svg`} width={squareSize-14} height={squareSize-14} style={{objectFit: 'cover'}} alt={piece}/>
            </div>
        );
    });
    return components;
}

