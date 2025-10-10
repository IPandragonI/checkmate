import {useSession} from "@/lib/auth-client";
import FullScreenLoader from "@/app/utils/FullScreenLoader";
import {useEffect, useState} from "react";
import TopSection from "@/app/components/dashboard/TopSection";
import EloSection from "@/app/components/dashboard/EloSection";
import GameHistorySection from "@/app/components/dashboard/GameHistorySection";
import StatisticsSection from "@/app/components/dashboard/StatisticsSection";

const Dashboard = () => {
    const {data: session, isPending} = useSession();
    const [user, setUser] = useState(null);
    const [gameHistory, setGameHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user?.id) return;
        setLoading(true);
        fetch('/api/user')
            .then(res => res.json())
            .then(data => {
                setUser(data.user);
                setGameHistory(data.gameHistory);
                console.log(data);
                setLoading(false);
            });
    }, [session?.user?.id]);

    if (isPending || !session?.user) return <FullScreenLoader/>;
    if (loading) return <FullScreenLoader/>;

    return (
        <div className="w-full h-full p-4 flex flex-col gap-6">
            {/* Bandeau principal en haut */}
            <div className="w-full grid lg:grid-cols-[3fr_1fr] grid-cols-1 gap-6">
                <TopSection user={user}/>
                <EloSection user={user}/>
            </div>

            {/* Section principale en dessous */}
            <div className="w-full grid lg:grid-cols-[3fr_1fr] grid-cols-1 gap-6">
                <div className="grid grid-cols-1 2xl:grid-cols-2 grid-rows-2 gap-4">
                    <GameHistorySection gameHistory={gameHistory} user={user}/>
                    <div className="col-span-2 row-span-1 lg:hidden block">
                        <StatisticsSection gameHistory={gameHistory} user={user}/>
                    </div>
                </div>
                {/* Colonne de blocs à droite (visible seulement sur desktop) */}
                <div className="flex flex-col gap-4 lg:block hidden">
                    <StatisticsSection gameHistory={gameHistory} user={user}/>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
