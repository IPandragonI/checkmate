import ChessboardWrapper from "@/app/components/chessBoard/ChessboardWrapper";
import GameJoin from "@/app/components/game/GameJoin";

export default function CreateGamePage() {
    return (
        <div
            className="relative z-10 flex flex-row items-start justify-center gap-8 w-full h-screen overflow-hidden px-14 pt-20 pb-8">
            <div className="hidden md:flex items-center justify-center w-3/5 h-full">
                <div
                    className="w-full h-full max-w-[32rem] max-h-[32rem] aspect-square shadow-lg rounded-lg overflow-hidden flex items-center justify-center mx-auto p-2 bg-base-200 border border-gray-200">
                    <ChessboardWrapper/>
                </div>
            </div>
            <div className="w-full md:w-2/5">
                <GameJoin/>
            </div>
        </div>
    );
}
