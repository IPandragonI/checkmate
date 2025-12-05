import Footer from '@/app/components/ui/Footer';

export default function TermsPage() {
    return (
        <main className="p-6 space-y-6 text-base-content">
            <h1 className="text-3xl font-bold">Conditions d'utilisation</h1>

            <div className="rounded-xl bg-base-200 shadow p-6 space-y-4">
                <p>
                    Bienvenue sur Checkmate. En utilisant notre service vous acceptez les présentes
                    conditions d'utilisation.
                </p>

                <section>
                    <h2 className="font-semibold">Accès au service</h2>
                    <p>Nous pouvons modifier ou interrompre le service à tout moment.</p>
                </section>

                <section>
                    <h2 className="font-semibold">Comportement utilisateur</h2>
                    <p>Les utilisateurs doivent respecter les règles et ne pas abuser du service.</p>
                </section>

                <section>
                    <h2 className="font-semibold">Limitation de responsabilité</h2>
                    <p>Checkmate n'est pas responsable des pertes indirectes ou dommages causés par
                        l'utilisation du service.</p>
                </section>
            </div>

            <Footer />
        </main>
    );
}

