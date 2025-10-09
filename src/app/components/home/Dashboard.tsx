import Link from "next/link";

const Dashboard = () => {
    return (
        <>
            <Link className="btn btn-primary btn-lg btn-wide" href={"/games/create"}>Créer une partie</Link>
            <Link className="btn btn-secondary btn-lg btn-wide" href={"/games/join"}>Rejoindre une partie</Link>
        </>
    );
}

export default Dashboard;