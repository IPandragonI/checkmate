import Link from "next/link";
import Footer from "@/app/components/ui/Footer";

export default function HelpPage() {
    return (
        <main className="p-6 space-y-6 text-base-content">
            <h1 className="text-3xl font-bold">Aide & Informations</h1>

            <section className="bg-base-200 rounded-xl shadow p-6">
                <h2 className="text-2xl font-semibold mb-3">Bienvenue sur Checkmate</h2>
                <p className="mb-2">Cette page rassemble toutes les informations utiles pour utiliser le site : création/rejoindre des parties, classement, règles du jeu et fonctionnement du système de classement (ELO).</p>
                <p>Si vous cherchez les règles complètes des échecs, rendez-vous sur la page <Link href="/rules" className="link">Règles</Link>.</p>
            </section>

            <section className="bg-base-100 rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-2">Créer une partie</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Allez sur <Link href="/games/create" className="link">Créer une partie</Link>.</li>
                    <li>Sélectionnez le mode de temps (bullet, blitz, classique) et, si souhaité, choisissez un bot ou attendez un adversaire humain.</li>
                    <li>Partagez le code de la partie avec votre adversaire pour qu'il rejoigne la salle.</li>
                </ul>
            </section>

            <section className="bg-base-100 rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-2">Rejoindre une partie</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Rendez-vous sur <Link href="/games/join" className="link">Rejoindre une partie</Link>.</li>
                    <li>Entrez le code de la partie fourni par le créateur et rejoignez la table.</li>
                    <li>Si la partie est privée ou déjà commencée, vous ne pourrez pas y entrer.</li>
                </ul>
            </section>

            <section className="bg-base-100 rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-3">Le classement et l'ELO</h3>
                <p className="mb-3">Checkmate utilise un système de classement basé sur l'élo pour estimer la force relative des joueurs. Voici la formule utilisée et un exemple concret.</p>

                <div className="mb-4">
                    <h4 className="font-semibold">Formule</h4>
                    <p>
                        Pour deux joueurs A et B, on calcule d'abord la probabilité attendue de victoire de A (E<sub>A</sub>) :
                    </p>
                    <div className="mt-2 font-mono bg-base-200 p-3 rounded">E_A = 1 / (1 + 10^((R_B - R_A)/400))</div>

                    <p className="mt-3">Après la partie, le nouveau classement de A est :</p>
                    <div className="mt-2 font-mono bg-base-200 p-3 rounded">R_A' = R_A + K * (S_A - E_A)</div>
                    <p className="mt-2">Où :</p>
                    <ul className="list-disc pl-5">
                        <li>K = 32 (constante utilisée sur Checkmate)</li>
                        <li>S_A est le score réel de la partie pour A : 1 pour une victoire, 0.5 pour une nulle, 0 pour une défaite</li>
                        <li>E_A est la probabilité attendue (calculée ci-dessus)</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold">Exemple</h4>
                    <p>Supposons :</p>
                    <ul className="list-disc pl-5">
                        <li>R_A = 1200 (joueur A)</li>
                        <li>R_B = 1000 (joueur B)</li>
                    </ul>
                    <p className="mt-2">Calcul de E_A :</p>
                    <div className="font-mono bg-base-200 p-3 rounded">E_A = 1 / (1 + 10^{(1000 - 1200)/400}) ≈ 1 / (1 + 10^{-0.5}) ≈ 0.76</div>

                    <p className="mt-2">Si A gagne (S_A = 1) :</p>
                    <div className="font-mono bg-base-200 p-3 rounded">R_A' = 1200 + 32 * (1 - 0.76) ≈ 1200 + 7.68 ≈ 1208</div>

                    <p className="mt-2">Si A perd (S_A = 0) :</p>
                    <div className="font-mono bg-base-200 p-3 rounded">R_A' = 1200 + 32 * (0 - 0.76) ≈ 1200 - 24.32 ≈ 1176</div>
                </div>

                <p className="mt-4">Remarques :</p>
                <ul className="list-disc pl-5">
                    <li>Un joueur gagne ou perd plus de points quand il bat un adversaire plus fort.</li>
                    <li>K = 32 permet des ajustements modérés; il existe d'autres variantes (K plus petit = changement plus lent).</li>
                    <li>Le elo n'est calculé que pour les parties classées en ligne.</li>
                </ul>
            </section>

            <section className="bg-base-100 rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-2">Sécurité et vérification</h3>
                <p className="mb-2">Pour certaines actions (comme signaler un problème ou récupérer votre compte), il est recommandé d'avoir une adresse e‑mail vérifiée. Vous pouvez vérifier votre adresse depuis votre <Link href="/profile" className="link">profil</Link>.</p>
            </section>

            <section className="bg-base-100 rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-2">FAQ rapide</h3>
                <dl className="space-y-3">
                    <div>
                        <dt className="font-semibold">Comment sont calculés les rangs ?</dt>
                        <dd>Le classement affiche les joueurs par ordre décroissant d'ELO. Les 3 premiers sont mis en avant.</dd>
                    </div>
                    <div>
                        <dt className="font-semibold">Puis-je jouer contre un bot ?</dt>
                        <dd>Oui, lors de la création d'une partie, choisissez un bot disponible.</dd>
                    </div>
                    <div>
                        <dt className="font-semibold">Comment signaler un joueur ?</dt>
                        <dd>Utilisez la page de contact pour nous envoyer un message ; indiquez les détails de la partie et le comportement observé.</dd>
                    </div>
                </dl>
            </section>

            <Footer />
        </main>
    );
}

