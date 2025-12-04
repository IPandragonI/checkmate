import Loader from "@/app/utils/Loader";
import {RotateCcw} from "lucide-react"
import {Svg} from "@/app/utils/Svg";
import ColorCard from "@/app/components/field/ColorCard";
import {PUZZLE_DIFFICULTY_LEVELS} from "@/app/types/game";

interface PuzzleInfosProps {
    loading?: boolean;
    message?: string;
    colorToPlay?: 'w' | 'b';
    puzzleNumber?: number;
    difficulty?: number;
    onReset?: () => void;
}

const PuzzleInfos: React.FC<PuzzleInfosProps> = ({
                                                     loading = false,
                                                     message = '',
                                                     colorToPlay = 'w',
                                                     puzzleNumber = 0,
                                                     difficulty = 0,
                                                     onReset = () => {
                                                     },
                                                 }) => {
    return (
        <section className="flex flex-col justify-between h-full">
            <div className={"flex flex-col gap-6"}>
                <h1 className="text-3xl font-bold text-center mb-2">Problèmes</h1>
            </div>
            <div className="flex flex-col items-center">
                {loading ?
                    <Loader/>
                    : (
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-4 mb-8">
                                <ColorCard
                                    selected={false}
                                    onClick={() => {
                                    }}
                                    label={colorToPlay === 'w' ? 'Blanc' : 'Noir'}
                                    icon={<Svg src={colorToPlay === 'w' ? '/pieces/wP.svg' : '/pieces/bP.svg'}
                                               alt={colorToPlay === 'w' ? 'Blanc' : 'Noir'} width={26} height={26}/>}
                                />
                                <div className="text-lg font-bold">Trait aux
                                    : {colorToPlay === 'w' ? 'Blancs' : 'Noirs'}</div>
                            </div>
                            {message && (
                                <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-center">
                                    {message}
                                </div>
                            )}
                            <div className="text-lg">Problème n°{puzzleNumber}</div>
                            <div className="text-md text-gray-500">Difficulté
                                : {PUZZLE_DIFFICULTY_LEVELS[difficulty]}</div>
                        </div>
                    )}
            </div>
            <button
                onClick={onReset}
                className={`btn btn-sm btn-outline btn-primary flex items-center gap-2 ${loading ? 'btn-disabled' : ''}`}
            >
                Réinitialiser
                <RotateCcw size={16}/>
            </button>
        </section>
    );
}

export default PuzzleInfos;