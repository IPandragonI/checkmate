"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {isUsernameAvailable, signIn, signUp} from "@/lib/auth-client";
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

        function isValidUsername(username: string) {
            // min 3, max 30, alphanum, underscore, dot
            return /^[a-zA-Z0-9_.]{3,30}$/.test(username);
        }

        if (mode === "register") {
            const confirm = formData.get("confirm") as string;
            if (password !== confirm) {
                setError("Les mots de passe ne correspondent pas.");
                setLoading(false);
                return;
            }
            if (!isValidUsername(username)) {
                setError("Nom d'utilisateur invalide. Utilisez 3-30 caractères, lettres, chiffres, _ ou .");
                setLoading(false);
                return;
            }
            const check = await isUsernameAvailable({ username });
            if (check.error || check.data?.available === false) {
                setError("Nom d'utilisateur déjà utilisé.");
                setLoading(false);
                return;
            }

            const res = await signUp.email({
                username: username,
                email: identifier,
                password: password,
                name: name,
                displayUsername: username
            });
            if (res.error) {
                setError(res.error.message || "Erreur lors de l'inscription, essayez de vous connecter.");
            }
        } else {
            const isEmail = identifier.includes("@");
            let res;
            if (isEmail) {
                res = await signIn.email({email: identifier, password});
            } else {
                res = await signIn.username({username: identifier, password});
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
                            <input name="name" className="input" type="text" placeholder="Nom complet" required autoComplete="name"/>
                            <input name="username" className="input" type="text" placeholder="Nom d'utilisateur" required autoComplete="x"/>
                        </>
                    )}
                    {mode === "login" ? (
                        <input name="identifier" className="input" type="text"
                               placeholder="Email ou nom d'utilisateur" required autoComplete="username"/>
                    ) : (
                        <input name="identifier" className="input" type="email" placeholder="Email" required autoComplete="email"/>
                    )}
                    <input name="password" className="input" type="password" placeholder="Mot de passe" required autoComplete={mode === "register" ? "new-password" : "current-password"}/>
                    {mode === "register" && (
                        <input name="confirm" className="input" type="password"
                               placeholder="Confirmer le mot de passe" required autoComplete="new-password"/>
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
