import Footer from '@/app/components/ui/Footer';

export default function PrivacyPage() {
    return (
        <main className="p-6 space-y-6 text-base-content">
            <h1 className="text-2xl font-bold">Politique de confidentialité</h1>

            <div className="rounded-xl bg-base-200 shadow p-6 space-y-4">
                <p>
                    Chez Checkmate, votre vie privée est importante. Cette politique explique quelles
                    informations nous collectons, pourquoi nous les utilisons, et comment vous pouvez
                    gérer vos données.
                </p>

                <section>
                    <h2 className="font-semibold">Données collectées</h2>
                    <p>Nous collectons les informations nécessaires au fonctionnement du service : nom,
                        email, identifiants, et données de parties.</p>
                </section>

                <section>
                    <h2 className="font-semibold">Utilisation des données</h2>
                    <p>Les données servent à authentifier les utilisateurs, gérer les parties,
                        améliorer le service et envoyer des emails transactionnels.</p>
                </section>

                <section>
                    <h2 className="font-semibold">Partage et sécurité</h2>
                    <p>Nous ne partageons pas vos informations personnelles avec des tiers sans votre
                        consentement, sauf obligations légales. Nous appliquons des mesures pour protéger
                        vos données.</p>
                </section>

                <section>
                    <h2 className="font-semibold">Contact</h2>
                    <p>Pour toute question relative à la vie privée, contactez-nous via la page Contact.</p>
                </section>
            </div>

            <Footer />
        </main>
    );
}

