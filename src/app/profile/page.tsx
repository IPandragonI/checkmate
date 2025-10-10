"use client";

import {useEffect, useState} from "react";
import {useSession} from "@/lib/auth-client";
import FullScreenLoader from "@/app/utils/FullScreenLoader";

export default function ProfilePage() {
    const {data: session, isPending} = useSession();
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<string>("light");
    const [loadingPref, setLoadingPref] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function fetchPreference() {
            setLoadingPref(true);
            try {
                const res = await fetch("/api/user-preference");
                if (!res.ok) throw new Error("Erreur lors de la récupération des préférences");
                const data = await res.json();
                if (data.preference?.theme) {
                    setTheme(data.preference.theme);
                    document.body.setAttribute("data-theme", data.preference.theme);
                }
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoadingPref(false);
            }
        }
        fetchPreference();
    }, []);

    async function savePreferences() {
        setSaving(true);
        setSuccess(false);
        setError(null);
        try {
            const res = await fetch("/api/user-preference", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ theme }),
            });
            if (!res.ok) throw new Error("Erreur lors de la sauvegarde des préférences");
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2500);
            document.body.setAttribute("data-theme", theme);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    if (isPending || loadingPref || !session?.user) return <FullScreenLoader />;

    const {user} = session;

    return (
        <main className="p-6 space-y-4 text-base-content">
            <h1 className="text-2xl font-bold">Profil</h1>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex flex-col lg:flex-row items-stretch gap-6">

                <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-base-200 shadow w-full lg:w-1/3">
                    <p className="text-lg font-semibold">{user.name}</p>
                    <div className="avatar placeholder">
                        <div className="bg-neutral-focus w-24 h-24 flex items-center justify-center text-3xl">
                            {user.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.image} alt="User Avatar"
                                     className="rounded-full w-24 h-24 object-cover" />
                            ) : (
                                <span>
                                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>


                <div className="flex flex-col gap-4 p-6 rounded-xl bg-base-200 shadow w-full lg:w-2/3">
                    <h2 className="text-lg font-semibold">Bio &amp; détails</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium text-slate-500">Nom complet</h3>
                            <p>{user.name}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-500">Nom d'utilisateur</h3>
                            <p>{user.username}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-500">Email</h3>
                            <p>{user.email}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-500">Email vérifié</h3>
                            <p>{user.emailVerified ? "Oui" : "Non"}</p>
                        </div>
                    </div>

                    {/*Si temps*/}
                    {/*<div className="mt-4">*/}
                    {/*    <a href="/auth/change-password" className="text-blue-500 hover:underline">*/}
                    {/*        Changer le mot de passe*/}
                    {/*    </a>*/}
                    {/*</div>*/}
                </div>
            </div>
            <div className="flex flex-col gap-4 p-6 rounded-xl bg-base-200 shadow w-full">
                <h2 className="text-lg font-semibold">Préférences</h2>

                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label htmlFor="theme" className="font-medium text-slate-500 min-w-[120px]">
                        Thème
                    </label>
                    <select id="theme" className="select select-bordered w-full max-w-xs" value={theme} onChange={(e) => setTheme(e.target.value)}>
                        <option value="corporate">Corporate</option>
                        <option value="valentine">Valentine</option>
                        <option value="lofi">Lofi</option>
                        <option value="night">Night</option>
                        <option value="winter">Winter</option>
                    </select>
                </div>


                <div className="mt-4 flex items-center gap-4">
                    <button className="btn btn-primary" onClick={savePreferences} disabled={saving}>
                        {saving ? (
                            <span className="loading loading-spinner loading-sm mr-2"></span>
                        ) : null}
                        {saving ? "Sauvegarde..." : "Sauvegarder les préférences"}
                    </button>
                    {success && (
                        <span className="text-success font-semibold">Préférences sauvegardées !</span>
                    )}
                </div>
            </div>
        </main>
    );
}