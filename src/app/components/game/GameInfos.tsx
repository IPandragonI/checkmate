import Svg from "@/app/utils/Svg";
import MoveList from "@/app/components/game/MoveList";
import GameChat from "@/app/components/game/GameChat";
import Loader from "@/app/utils/Loader";

interface GameInfosProps {
    game: any;
    playerWhite: any;
    playerBlack: any;
    user: any;
    moves: any[];
    chatMessages?: any[];
    isReconnecting?: boolean;
    socket?: any;
}

const GameInfos: React.FC<GameInfosProps> = ({
                                                 game,
                                                 playerWhite,
                                                 playerBlack,
                                                 user,
                                                 moves,
                                                 chatMessages,
                                                 isReconnecting,
                                                 socket
                                             }) => {
    let adversaire = null;
    let adversaireImg = null;
    let adversaireElo = null;

    if (game.bot) {
        adversaire = game.bot.name;
        adversaireImg = game.bot.img;
        adversaireElo = game.bot.elo;
    } else if (user?.id === playerWhite.id && playerBlack.id) {
        adversaire = playerBlack.username;
        adversaireImg = playerBlack.image;
        adversaireElo = playerBlack.elo;
    } else if (user?.id === playerBlack.id && playerWhite.id) {
        adversaire = playerWhite.username;
        adversaireImg = playerWhite.image;
        adversaireElo = playerWhite.elo;
    }

    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
    const isMobile = viewportWidth < 768;

    return (
        <div
            className="flex flex-col justify-between md:h-[34rem] p-4 md:p-8 rounded-lg gap-6 border border-gray-200 shadow-lg fieldset bg-base-200 overflow-y-auto">
            <div className={"h-full flex flex-col gap-3"}>
                <div className="flex md:flex-col items-center justify-between h-2/6">
                    <div className="flex md:flex-col items-center">
                        {adversaireImg ? (
                            <Svg src={adversaireImg} alt={adversaire} width={isMobile ? 40 : 96} height={isMobile ? 40 : 96} className="mr-4 md:mr-0 md:mb-2"/>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                                <span className="text-4xl text-gray-400">?</span>
                            </div>
                        )}
                        <div className="text-2xl font-bold mb-1">{adversaire || "Adversaire"}</div>
                    </div>

                    <div className="flex flex-col items-center">
                        {adversaireElo && (
                            <div className="text-sm text-gray-500">Elo : {adversaireElo}</div>
                        )}
                    </div>
                </div>

                {isReconnecting ? (
                    <div className="flex flex-col items-center justify-center w-full h-3/6">
                        <Loader/>
                        <div className="mt-4 text-lg text-primary font-semibold">En attente de la reconnexion...
                        </div>
                    </div>
                ) : (
                    <div className="hidden md:flex tabs tabs-lift w-full h-3/6">
                        <input type="radio" name="my_tabs_3" className="tab" aria-label="Coups" defaultChecked/>
                        <div className="tab-content bg-base-100 p-6 h-full">
                            <MoveList moves={moves}/>
                        </div>
                        {!game.bot && (
                            <>
                                <input type="radio" name="my_tabs_3" className="tab" aria-label="Messages"/>
                                <div className="tab-content bg-base-100 p-6 h-full">
                                    <GameChat socket={socket} gameId={game.id} user={user}
                                              chatMessages={chatMessages || []}/>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="hidden h-1/6 md:flex flex-col justify-center w-full">
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