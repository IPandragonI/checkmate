import React from "react";
import {FilledSvg} from "@/app/utils/Svg";

export function getCustomPieces() {
    const pieceNames = [
        'wP', 'wN', 'wB', 'wR', 'wQ', 'wK',
        'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'
    ];
    const components: Record<string, () => React.JSX.Element> = {};
    pieceNames.forEach(piece => {
        components[piece] = () => (
            <div style={{
                width: "100%",
                height: "100%",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <FilledSvg src={`/pieces/${piece}.svg`} alt={piece} style={{objectFit: 'cover'}} />
            </div>
        );
    });
    return components;
}
