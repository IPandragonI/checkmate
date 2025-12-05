import Loader from "@/app/utils/Loader";
import {RotateCcw, Lightbulb, ChevronRight, Eraser, Puzzle, Skull} from "lucide-react"
import {Svg} from "@/app/utils/Svg";
import ColorCard from "@/app/components/field/ColorCard";
import {PUZZLE_DIFFICULTY_LEVELS, CATEGORY_DEFINITIONS, PUZZLE_THEMES} from "@/app/types/game";

interface PuzzleInfosProps {
    loading?: boolean;
    errorMessage?: string;
    colorToPlay?: 'w' | 'b';
    themes?: string[];
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
                                                     themes = [],
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
    const category = CATEGORY_DEFINITIONS.find(cat => cat.keywords.some(k => themes.includes(k)));
    const themesLabels = themes.map(t => PUZZLE_THEMES[t] || t);
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
                                <div className="text-lg font-bold">Trait
                                    aux {colorToPlay === 'w' ? 'Blancs' : 'Noirs'}</div>
                            </div>
                            <p className="text-sm text-gray-500">{category?.message}</p>
                        </div>
                        {errorMessage && (
                            <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-center">
                                {errorMessage}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center mb-2">
                                <span className="text-base">
                                    <div className="font-bold flex items-center">
                                        <Puzzle size={22} className="inline-block mr-2"/>Thèmes :</div>
                                    <p className="ml-8">{themesLabels.join(', ')}</p>
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-base">
                                    <div className="font-bold flex items-center">
                                        <Skull size={22} className="inline-block mr-2"/>Difficulté :</div>
                                    <p className="ml-8">{PUZZLE_DIFFICULTY_LEVELS[difficulty]}</p>
                                </span>
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
                    Nouveau problème
                </button>
            )}
        </section>
    );
}

export default PuzzleInfos;