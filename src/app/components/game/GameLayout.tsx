import ChessboardWrapper from "@/app/components/chessBoard/ChessboardWrapper";
import GamePlayerInfo from "@/app/components/game/GamePlayerInfo";

interface GameLayoutProps {
    chessBoard?: any
    gamePanel: any
    isGameStarted?: boolean
}

const GameLayout: React.FC<GameLayoutProps> = ({
                                                   chessBoard = <ChessboardWrapper/>,
                                                   gamePanel,
                                                   isGameStarted = false
                                               }) => {

    const whitePlayer = gamePanel?.props.playerWhite;
    const blackPlayer = gamePanel?.props.playerBlack;
    const user = gamePanel?.props.user;

    return (
        <div className={`flex ${isGameStarted ? "flex-col-reverse md:flex-row" : "flex-row"} items-start justify-center gap-8 w-full overflow-hidden h-screen p-6`}>
            <div className={`${isGameStarted ? "" : "hidden"} md:flex gap-4 flex-col items-center justify-center md:w-3/5 w-full h-full`}>
                <div className={`h-full w-full max-w-sm lg:max-w-md 2xl:max-w-lg mx-auto flex flex-col items-center gap-2 justify-start md:justify-between py-8 md:py-0`}>
                    <GamePlayerInfo isGameStarted={isGameStarted} player={user?.id === whitePlayer?.id ? whitePlayer : blackPlayer}/>
                    <div className={"w-full max-w-sm lg:max-w-md 2xl:max-w-lg aspect-square shadow-lg rounded-lg flex items-center justify-center mx-auto p-2 bg-base-200 border border-gray-200"}>
                        {chessBoard}
                    </div>
                    <GamePlayerInfo isGameStarted={isGameStarted} player={user?.id === whitePlayer?.id ? blackPlayer : whitePlayer}/>
                </div>
            </div>
            <div className={`w-full h-full md:w-2/5 ${isGameStarted ? "hidden" : ""} md:flex`}>
                <div className="flex flex-col justify-between p-8 rounded-lg gap-6 border border-gray-200 shadow-lg fieldset bg-base-200 overflow-y-auto h-full">
                    {gamePanel}
                </div>
            </div>
        </div>
    )
}

export default GameLayout;