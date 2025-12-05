import ChessboardWrapper from "@/app/components/chessBoard/ChessboardWrapper";
import GamePlayerInfo from "@/app/components/game/GamePlayerInfo";
import {CapturedPieces, WEIGHT} from "@/app/types/game";

interface GameLayoutProps {
    chessBoard?: any
    gamePanel?: any
    isGameStarted?: boolean
    capturedPieces?: CapturedPieces
    playerPlaying?: 'w' | 'b'
    whiteTimeLeft?: number | null
    blackTimeLeft?: number | null
}

const GameLayout: React.FC<GameLayoutProps> = ({
                                                   chessBoard = <ChessboardWrapper/>,
                                                   gamePanel = null,
                                                   isGameStarted = false,
                                                   capturedPieces = {white: [], black: []},
                                                   playerPlaying = 'w',
                                                   whiteTimeLeft,
                                                   blackTimeLeft,
                                               }) => {

    const whitePlayer = gamePanel?.props?.playerWhite ?? gamePanel?.props?.game?.bot;
    const blackPlayer = gamePanel?.props?.playerBlack ?? gamePanel?.props?.game?.bot;
    const user = gamePanel?.props?.user;

    const me = user?.id === whitePlayer?.id ? whitePlayer : blackPlayer;
    const myCapturedPieces = user?.id === whitePlayer?.id ? capturedPieces?.white : capturedPieces?.black;

    const opponent = user?.id === whitePlayer?.id ? blackPlayer : whitePlayer;
    const opponentCapturedPieces = user?.id === whitePlayer?.id ? capturedPieces?.black : capturedPieces?.white;

    const myWeight = myCapturedPieces.reduce((acc: number, piece: string) => acc + (WEIGHT[piece.toLowerCase()] || 0), 0);
    const opponentWeight = opponentCapturedPieces.reduce((acc: number, piece: string) => acc + (WEIGHT[piece.toLowerCase()] || 0), 0);

    const myWeightDiff = myWeight - opponentWeight;
    const opponentWeightDiff = opponentWeight - myWeight;

    const isWhite = user?.id === whitePlayer?.id;

    return (
        <div className={`flex ${isGameStarted ? "flex-col-reverse md:flex-row" : "flex-row"} items-start justify-center gap-8 w-full overflow-hidden h-screen p-6`}>
            <div className={`${isGameStarted ? "" : "hidden md:block"} md:w-3/5 w-full h-full flex`}>
                <div className={`h-full w-full mx-auto flex flex-col items-center justify-center py-8 md:py-0`}>
                    <div className={`w-full ${isGameStarted ? "justify-start md:justify-between" : "justify-center"} w-full flex flex-col items-center gap-2`}>
                        <GamePlayerInfo isGameStarted={isGameStarted} player={opponent} capturedPieces={opponentCapturedPieces} weightDiff={opponentWeightDiff} isWhite={!isWhite} playerPlaying={playerPlaying} whiteTimeLeft={whiteTimeLeft} blackTimeLeft={blackTimeLeft}/>
                        <div className={`${isGameStarted ? "w-[80%]" : "w-[90%]"} aspect-square shadow-lg rounded-lg flex items-center justify-center mx-auto p-2 bg-base-200 border border-gray-200`}>
                            {chessBoard}
                        </div>
                        <GamePlayerInfo isGameStarted={isGameStarted} player={me} capturedPieces={myCapturedPieces} weightDiff={myWeightDiff} isWhite={isWhite} playerPlaying={playerPlaying} whiteTimeLeft={whiteTimeLeft} blackTimeLeft={blackTimeLeft}/>
                    </div>
                </div>
            </div>

            <div className={`w-full h-full md:w-2/5 ${isGameStarted ? "hidden" : ""} md:flex max-h-[50rem] md:max-h-full`}>
                <div className="flex flex-col justify-between p-8 rounded-lg gap-6 border border-gray-200 shadow-lg fieldset bg-base-200 overflow-y-auto h-full w-full">
                    {gamePanel}
                </div>
            </div>
        </div>
    )
}

export default GameLayout;