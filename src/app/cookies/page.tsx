import Footer from '@/app/components/ui/Footer';

export default function CookiesPage() {
    return (
        <main className="p-6 space-y-6 text-base-content">
            <h1 className="text-3xl font-bold">Politique de cookies</h1>

            <div className="rounded-xl bg-base-200 shadow p-6 space-y-4">
                <p>
                    Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et
                    fournir des fonctionnalités. Vous pouvez contrôler les cookies via les paramètres
                    de votre navigateur.
                </p>

                <section>
                    <h2 className="font-semibold">Types de cookies</h2>
                    <p>Cookies essentiels, analytiques et de préférences.</p>
                </section>

                <section>
                    <h2 className="font-semibold">Désactivation</h2>
                    <p>La désactivation des cookies peut impacter certaines fonctionnalités du site.</p>
                </section>
            </div>

            <Footer />
        </main>
    );
}

