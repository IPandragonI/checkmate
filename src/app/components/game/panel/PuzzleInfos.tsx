import Loader from "@/app/utils/Loader";
import {RotateCcw, Lightbulb, ChevronRight, Eraser, Puzzle, Skull} from "lucide-react"
import {Svg} from "@/app/utils/Svg";
import ColorCard from "@/app/components/field/ColorCard";
import {PUZZLE_DIFFICULTY_LEVELS} from "@/app/types/game";

interface PuzzleInfosProps {
    loading?: boolean;
    errorMessage?: string;
    colorToPlay?: 'w' | 'b';
    puzzleNumber?: number;
    difficulty?: number;
    nbMoves?: number;
    isSolved?: boolean;
    onReset?: () => void;
    onFullReset?: () => void;
    onHelp?: () => void;
    onNext?: () => void;
}

const PuzzleInfos: React.FC<PuzzleInfosProps> = ({
                                                     loading = false,
                                                     errorMessage = '',
                                                     colorToPlay = 'w',
                                                     puzzleNumber = 0,
                                                     difficulty = 0,
                                                     nbMoves = 1,
                                                     isSolved = false,
                                                     onReset = () => {
                                                     },
                                                     onFullReset = () => {

                                                     },
                                                     onHelp = () => {
                                                     },
                                                     onNext = () => {
                                                     },
                                                 }) => {
    return (
        <section className="flex flex-col justify-between h-full">
            <div className={"flex flex-col gap-6"}>
                <h1 className="text-3xl font-bold text-center mb-2">Problèmes</h1>
            </div>
            {loading ?
                <Loader/> : (
                    <div className={"flex flex-col justify-between h-full p-4"}>
                        <div className="flex flex-col items-start bg-base-100 p-4 rounded-lg">
                            <div className="flex items-center gap-4 mb-8">
                                <ColorCard
                                    selected={false}
                                    onClick={() => {
                                    }}
                                    label={colorToPlay === 'w' ? 'Blanc' : 'Noir'}
                                    icon={<Svg src={colorToPlay === 'w' ? '/pieces/wP.svg' : '/pieces/bP.svg'}
                                               alt={colorToPlay === 'w' ? 'Blanc' : 'Noir'} width={24} height={24}/>}
                                />
                                <div className="text-lg font-bold">Trait aux {colorToPlay === 'w' ? 'Blancs' : 'Noirs'}</div>
                            </div>
                            <p className="text-sm text-gray-500">Trouvez le mat
                                en {Math.ceil(nbMoves / 2)} coup{Math.ceil(nbMoves / 2) > 2 ? 's' : ''} !</p>
                        </div>
                        {errorMessage && (
                            <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-center">
                                {errorMessage}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center mb-2">
                                <Puzzle size={24} className="inline-block mr-2"/>
                                <p className="text-lg">Problème n°{puzzleNumber}</p>
                            </div>
                            <div className="flex items-center">
                                <Skull size={22} className="inline-block mr-2"/>
                                <p className="text-md">Difficulté : {PUZZLE_DIFFICULTY_LEVELS[difficulty]}</p>
                            </div>
                        </div>
                    </div>
                )}
            {isSolved && errorMessage && (
                <button
                    onClick={onFullReset}
                    className={`btn btn-outline btn-error flex items-center gap-2 ${loading ? 'btn-disabled' : ''}`}
                >
                    <Eraser size={16}/>
                    Réinitialiser mon avancée
                </button>
            )}
            {!isSolved && errorMessage && (
                <button
                    onClick={onReset}
                    className={`btn btn-outline btn-error flex items-center gap-2 ${loading ? 'btn-disabled' : ''}`}
                >
                    <RotateCcw size={16}/>
                    Réinitialiser
                </button>
            )}
            {!isSolved && !errorMessage && (
                <button
                    onClick={onHelp}
                    className={`btn btn-outline btn-secondary flex items-center gap-2 ${loading ? 'btn-disabled' : ''}`}
                >
                    <Lightbulb size={16}/>
                    Indication
                </button>
            )}
            {isSolved && !errorMessage && (
                <button
                    onClick={onNext}
                    className={`btn btn-outline btn-primary flex items-center gap-2 ${loading ? 'btn-disabled' : ''}`}
                >
                    <ChevronRight size={16}/>
                    Problème Suivant
                </button>
            )}
        </section>
    );
}

export default PuzzleInfos;