"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {signIn, signUp} from "@/lib/auth-client";
import {useSession} from "@/lib/auth-client";

export default function LoginOrRegisterPage() {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const {data: session, isPending} = useSession();

    useEffect(() => {
        if (!isPending && session?.user) {
            router.push("/");
        }
    }, [isPending, session, router]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const identifier = formData.get("identifier") as string;
        const username = formData.get("username") as string;
        const name = formData.get("name") as string;
        const password = formData.get("password") as string;

        if (mode === "register") {
            const confirm = formData.get("confirm") as string;
            if (password !== confirm) {
                setError("Les mots de passe ne correspondent pas.");
                setLoading(false);
                return;
            }
            const res = await signUp.email({
                username: username, email: identifier, password: password, name: name
            });
            if (res.error) {
                setError(res.error.message || "Erreur lors de l'inscription.");
            }
        } else {
            const isEmail = identifier.includes("@");
            let res;
            if (isEmail) {
                res = await signIn.email({email: identifier, password});
            } else {
                res = await signIn.username({username: identifier.toLowerCase(), password});
            }
            if (res.error) {
                setError(res.error.message || "Erreur lors de la connexion.");
            }
        }
        setLoading(false);
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-base-300">
            <section className="bg-base-200 p-8 rounded-xl shadow-md w-full max-w-md text-center">
                <div className="text-2xl font-bold text-primary mb-6">
                    {mode === "login" ? "Connexion" : "Inscription"}
                </div>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                {success && <p className="text-green-600 mb-2">{success}</p>}
                <form onSubmit={handleSubmit} className="fieldset w-full max-w-sm p-6">
                    {mode === "register" && (
                        <>
                            <input name="name" className="input mt-2" type="text" placeholder="Nom complet" required/>
                            <input name="username" className="input" type="text" placeholder="Nom d'utilisateur"
                                   required/>
                        </>
                    )}
                    {mode === "login" ? (
                        <input name="identifier" className="input mt-2" type="text"
                               placeholder="Email ou nom d'utilisateur" required/>
                    ) : (
                        <input name="identifier" className="input mt-2" type="email" placeholder="Email" required/>
                    )}
                    <input name="password" className="input mt-2" type="password" placeholder="Mot de passe" required/>
                    {mode === "register" && (
                        <input name="confirm" className="input mt-2" type="password"
                               placeholder="Confirmer le mot de passe" required/>
                    )}
                    <button className="btn btn-neutral mt-4 w-full" type="submit" disabled={loading}>
                        {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "S'inscrire"}
                    </button>
                    <p className="mt-4 text-sm">
                        {mode === "login" ? (
                            <>Pas encore de compte ? {" "}
                                <button type="button"
                                        className="text-primary font-medium hover:underline cursor-pointer"
                                        onClick={() => {
                                            setMode("register");
                                            setError(null);
                                            setSuccess(null);
                                        }}>
                                    S'inscrire
                                </button>
                            </>
                        ) : (
                            <>Déjà un compte ? {" "}
                                <button type="button"
                                        className="text-primary font-medium hover:underline cursor-pointer"
                                        onClick={() => {
                                            setMode("login");
                                            setError(null);
                                            setSuccess(null);
                                        }}>
                                    Se connecter
                                </button>
                            </>
                        )}
                    </p>
                </form>
            </section>
        </main>
    );
}
