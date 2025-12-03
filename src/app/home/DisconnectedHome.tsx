import Link from "next/link";

const disconnectedHome = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <h1 className="text-4xl font-bold tracking-wider text-primary">Bienvenue sur Checkmate</h1>
            <p>Pour pouvoir créer ou rejoindre une partie, veuillez vous connecter ou vous inscrire.</p>
            <Link className="btn btn-primary btn-lg btn-wide" href={"/auth/login-or-register"}>Se connecter / S'inscrire</Link>
        </div>
    )
}

export default disconnectedHome;