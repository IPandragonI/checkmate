import Footer from '@/app/components/ui/Footer';

export default function AboutPage() {
    return (
        <main className="p-6 space-y-6 text-base-content">
            <h1 className="text-2xl font-bold">À propos de Checkmate</h1>

            <div className="rounded-xl bg-base-200 shadow p-6 space-y-4">
                <p>
                    Checkmate est une plateforme d'échecs pensée pour jouer rapidement contre des
                    amis ou des bots, analyser les parties et suivre son classement.
                </p>

                <section>
                    <h2 className="font-semibold">Notre mission</h2>
                    <p>Offrir une expérience d'échecs simple et agréable pour tous les niveaux.</p>
                </section>

                <section>
                    <h2 className="font-semibold">Fonctionnalités</h2>
                    <ul className="list-disc list-inside">
                        <li>Parties en temps réel</li>
                        <li>Classement et historique</li>
                        <li>Bots d'entraînement</li>
                    </ul>
                </section>
            </div>

            <Footer />
        </main>
    );
}

