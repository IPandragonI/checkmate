import {Award, Heart, Swords} from "lucide-react";
import {timeModes} from "@/app/components/field/TimeModeField";

function StatisticsSection({gameHistory, user}: { gameHistory?: any[], user?: any }) {
    if (!gameHistory || gameHistory.length === 0) {
        return (
            <div className="bg-base-200 rounded-xl shadow p-6 h-full">
                <h2 className="text-lg font-bold mb-4">Statistiques</h2>
                <p>Aucune partie jouée pour l'instant.</p>
            </div>
        );
    }

    const totalGames = gameHistory.filter(g => g.status === "FINISHED").length;
    const wins = gameHistory.filter(g => g.status === "FINISHED" && g.result === "win" && g.userId === user?.id).length;
    const losses = gameHistory.filter(g => g.status === "FINISHED" && g.result === "loss" && g.userId === user?.id).length;
    const draws = gameHistory.filter(g => g.status === "FINISHED" && g.result === "draw" && g.userId === user?.id).length;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0";
    const favoriteMode = gameHistory.reduce((acc, game) => {
        acc[game.timeMode] = (acc[game.timeMode] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const favoriteModeKey = Object.keys(favoriteMode).reduce((a, b) => favoriteMode[a] > favoriteMode[b] ? a : b, "");
    const favoriteModeLabel = timeModes.find(m => m.key === favoriteModeKey)?.label || "N/A";
    const favoriteModeCount = favoriteMode[favoriteModeKey] || 0;

    return (
        <div className="bg-base-200 rounded-xl shadow p-6 h-full max-h-[32rem]">
            <h2 className="text-lg font-bold mb-4">Statistiques</h2>
            <ul className="list rounded-box">
                <li className="list-row">
                    <Swords size={24} className="text-primary"/>
                    <div>
                        <div>Parties jouées</div>
                        <div className="text-xs uppercase font-semibold opacity-60">Total des parties</div>
                    </div>
                    <span className="">
                        <span className="text-lg font-bold">{totalGames}</span>
                    </span>
                </li>
                <li className="list-row">
                    <Award size={24} className="text-secondary"/>
                    <div>
                        <div>Win rate</div>
                        <div className="text-xs uppercase font-semibold opacity-60">Pourcentage de victoires</div>
                    </div>
                    <span className="">
                        <span className="text-lg font-bold">{winRate}%</span>
                    </span>
                </li>
            </ul>

            <span className="divider"></span>
            <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-100">
                <div className="stat">
                    <div className="stat-title">Victoires</div>
                    <div className="stat-value">{totalGames}</div>
                </div>

                <div className="stat">
                    <div className="stat-title">Défaites</div>
                    <div className="stat-value">{losses}</div>
                </div>

                <div className="stat">
                    <div className="stat-title">Nuls</div>
                    <div className="stat-value">{draws}</div>
                </div>
            </div>

            <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-100 mt-4">
                <div className="stat">
                    <div className="stat-figure text-primary">
                        <Heart size={32} className="inline-block"/>
                    </div>
                    <div className="stat-title">Mode préféré</div>
                    <div className="stat-value text-primary">{favoriteModeLabel || "N/A"}</div>
                    <div className="stat-desc">{favoriteModeCount} parties jouées</div>
                </div>
            </div>
        </div>
    );
}

export default StatisticsSection;