import Link from "next/link";

const disconnectedHome = () => {
    return (
        <>
            <p>Pour pouvoir créer ou rejoindre une partie, veuillez vous connecter ou vous inscrire.</p>
            <Link className="btn btn-primary btn-lg btn-wide" href={"/auth/login-or-register"}>Se connecter / S'inscrire</Link>
        </>
    )
}

export default disconnectedHome;