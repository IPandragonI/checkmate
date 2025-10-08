import React from "react";
import Svg from "@/app/utils/Svg";
import MoveList from "@/app/components/game/MoveList";
import GameChat from "@/app/components/game/GameChat";
import Loader from "@/app/utils/Loader";
import {Flag} from "lucide-react";

interface GameInfosProps {
    game: any;
    user: any;
    moves: any[];
    chatMessages?: any[];
    isReconnecting?: boolean;
    socket?: any;
}

const GameInfos: React.FC<GameInfosProps> = ({game, user, moves, chatMessages, isReconnecting, socket}) => {
    let adversaire = null;
    let adversaireImg = null;
    let adversaireElo = null;

    if (game.bot) {
        adversaire = game.bot.name;
        adversaireImg = game.bot.img;
        adversaireElo = game.bot.elo;
    } else if (user?.id === game.playerWhiteId && game.playerBlack) {
        adversaire = game.playerBlack.username;
        adversaireImg = game.playerBlack.image;
        adversaireElo = game.playerBlack.elo;
    } else if (user?.id === game.playerBlackId && game.playerWhite) {
        adversaire = game.playerWhite.username;
        adversaireImg = game.playerWhite.image;
        adversaireElo = game.playerWhite.elo;
    }

    return (
        <div
            className="flex flex-col justify-between h-[36rem] p-8 rounded-lg gap-6 border border-gray-200 shadow-lg fieldset bg-base-200 overflow-y-auto">
            <div className={"h-full flex flex-col gap-3"}>
                <div className="flex flex-col items-center h-2/6">
                    {adversaireImg ? (
                        <Svg src={adversaireImg} alt={adversaire} width={96} height={96} className="mb-2"/>
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                            <span className="text-4xl text-gray-400">?</span>
                        </div>
                    )}
                    <div className="text-2xl font-bold mb-1">{adversaire || "Adversaire"}</div>
                    {adversaireElo && (
                        <div className="text-sm text-gray-500">Elo : {adversaireElo}</div>
                    )}
                </div>

                {isReconnecting ? (
                    <div className="flex flex-col items-center justify-center w-full h-3/6">
                        <Loader/>
                        <div className="mt-4 text-lg text-primary font-semibold">En attente de la reconnexion...
                        </div>
                    </div>
                ) : (
                    <div className="tabs tabs-lift w-full h-3/6">
                        <input type="radio" name="my_tabs_3" className="tab" aria-label="Coups" defaultChecked/>
                        <div className="tab-content bg-base-100 border-base-300 p-6 h-full">
                            <MoveList moves={moves}/>
                        </div>
                        {!game.bot && (
                            <>
                                <input type="radio" name="my_tabs_3" className="tab" aria-label="Tchat"/>
                                <div className="tab-content bg-base-100 border-base-300 p-6 h-full">
                                    <GameChat socket={socket} gameId={game.id} user={user}
                                              chatMessages={chatMessages || []}/>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="h-1/6">
                    <div className={"grid grid-cols-6 gap-3"}>
                        <div className="flex flex-col items-center col-span-3">
                            <span className="text-xs text-gray-500">Coups joués</span>
                            <span className="text-sm font-bold">{moves.length}</span>
                        </div>
                        <div className="flex flex-col items-center col-span-3">
                            <span className="text-xs text-gray-500">Mode</span>
                            <span className="text-sm font-bold">{game.bot ? "Contre un bot" : "En ligne"}</span>
                        </div>

                        {/*<button className="btn btn-outline btn-sm w-full col-span-6">*/}
                        {/*    <Flag size={16}/>*/}
                        {/*</button>*/}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameInfos;