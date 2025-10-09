import ChessboardWrapper from "@/app/components/chessBoard/ChessboardWrapper";

interface GameLayoutProps {
    chessBoard?: any
    gamePanel: any
    isGameStarted?: boolean
}

const GameLayout: React.FC<GameLayoutProps> = ({chessBoard = <ChessboardWrapper/>, gamePanel, isGameStarted = false}) => {
    return (
        <div className={`flex ${isGameStarted ? "flex-col-reverse md:flex-row" : "flex-row"} items-start justify-center gap-8 w-full overflow-hidden px-4 md:px-10 pb-6`}>
            <div className={`${isGameStarted ? "" : "hidden"} md:flex items-center justify-center md:w-3/5 w-full`}>
                <div className="w-full h-full max-w-[34rem] max-h-[34rem] aspect-square shadow-lg rounded-lg overflow-hidden flex items-center justify-center mx-auto p-2 bg-base-200 border border-gray-200">
                    {chessBoard}
                </div>
            </div>
            <div className="w-full md:w-2/5">
                {gamePanel}
            </div>
        </div>
    )
}

export default GameLayout;