import {timeModes} from "@/app/components/field/TimeModeField";
import {Svg} from "@/app/utils/Svg";
import {GameResult} from "@prisma/client";

function GameHistorySection({gameHistory, user}: { gameHistory?: any[], user?: any }) {
    if (!gameHistory || gameHistory.length === 0) {
        return (
            <div className="bg-base-200 rounded-xl shadow p-6 h-full col-span-4 xl:col-span-3 row-span-2">
                <h2 className="text-lg font-bold mb-4">Historique des parties</h2>
                <p>Aucune partie jouée pour l'instant.</p>
            </div>
        );
    }
    return (
        <div className="bg-base-200 rounded-xl shadow p-6 h-full overflow-x-auto col-span-4 xl:col-span-3 row-span-2 max-h-[32rem]">
            <h2 className="text-lg font-bold mb-4">Historique des parties</h2>
            <table className="min-w-full text-sm table text-center bg-base-100">
                <thead>
                <tr>
                    <th>Mode</th>
                    <th>Joueurs</th>
                    <th>Résultat</th>
                    <th>Coups</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                {gameHistory.slice(0, 10).map((game, idx) => {
                    const modeObj = timeModes.find(m => m.key === game.timeMode) || timeModes[0];
                    if (game.status !== 'FINISHED') return null;
                    const playerWhite = game.playerWhite ? game.playerWhite : game.bot;
                    const playerBlack = game.playerBlack ? game.playerBlack : game.bot;
                    const gameResultForUser = (game.playerWhiteId === user?.id && game.result === GameResult.WHITE_WIN) ||
                        (game.playerBlackId === user?.id && game.result === GameResult.BLACK_WIN) ? 'WIN' :
                        (game.result === GameResult.WHITE_WIN ? 'LOSS' : 'DRAW');
                    return (
                        <tr key={game.id || idx}>
                            <td className="py-2 px-2 flex flex-col items-center justify-center">
                                {modeObj.icon}
                                <span className="text-xs mt-1">{modeObj.label}</span>
                            </td>
                            <td className="py-2 px-2">
                                <div className="flex flex-col justify-center w-full gap-1">
                                    <div className="flex justify-center gap-2 w-full">
                                        <Svg src="/pieces/wP.svg" alt="Blanc" width={20} height={20}/>
                                        <span className={`${game.playerWhiteId === user?.id ? 'font-bold' : ''}`}>
                                            {playerWhite.username}
                                        </span>
                                        <p className="text-gray-500">
                                            ({playerWhite.elo})
                                        </p>
                                    </div>
                                    <div className="flex justify-center gap-2 w-full">
                                        <Svg src="/pieces/bP.svg" alt="Noir" width={20} height={20}/>
                                        <span className={`${game.playerBlackId === user?.id ? 'font-bold' : ''}`}>
                                            {playerBlack.username}
                                        </span>
                                        <p className="text-gray-500">
                                            ({playerBlack.elo})
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-2">
                                <div className="flex items-center justify-center">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold
                                        ${gameResultForUser === 'WIN' ? 'bg-green-200 text-green-800' :
                                            gameResultForUser === 'LOSS' ? 'bg-red-200 text-red-800' :
                                                'bg-yellow-200 text-yellow-800'}`}>
                                        {gameResultForUser === 'WIN' ? 'Victoire' :
                                            gameResultForUser === 'LOSS' ? 'Défaite' : 'Nulle'}
                                    </span>
                                </div>
                            </td>
                            <td className="py-2 px-2">{game.moves.length}</td>
                            <td className="py-2 px-2">{game.finishedAt ? new Date(game.finishedAt).toLocaleDateString('fr-FR') : '-'}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}

export default GameHistorySection;