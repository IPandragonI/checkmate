export default function Footer() {
    const links = [
        { href: '/privacy', label: "Politique de confidentialité" },
        { href: '/terms', label: "Conditions d'utilisation" },
        { href: '/cookies', label: 'Politique de cookies' },
        { href: '/contact', label: 'Contact' },
        { href: '/about', label: 'À propos' },
    ];

    return (
        <footer className="footer footer-center p-4 text-base-content">
            <div className="w-full max-w-4xl">
                <nav aria-label="Liens utiles" className="flex items-center justify-center flex-wrap">
                    {links.map((link, idx) => (
                        <div key={link.href} className="flex items-center">
                            <a href={link.href} className="hover:underline">
                                {link.label}
                            </a>
                            {idx < links.length - 1 && (
                                <span
                                    className="w-1.5 h-1.5 rounded-full bg-base-content/50 mx-3"
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                    ))}
                </nav>

                <div className="text-center">
                    <span>Checkmate Ⓒ 2025</span>
                </div>
            </div>
        </footer>
    );
}