 import Footer from '@/app/components/ui/Footer';

export default function RulesPage() {
    return (
        <main className="p-6 space-y-6 text-base-content">
            <h1 className="text-3xl font-bold">Règles des échecs — Guide complet</h1>

            <div className="rounded-xl bg-base-200 shadow p-6 space-y-6">
                <p className="text-lg">Cette page rassemble les règles officielles et les notions essentielles
                    pour jouer aux échecs.</p>

                <nav aria-label="Table des matières" className="mb-8">
                    <h2 className="text-xl font-semibold">Sommaire</h2>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><a href="#goal" className="link">But du jeu</a></li>
                        <li><a href="#pieces" className="link">Les pièces et leurs déplacements</a></li>
                        <li><a href="#capture" className="link">Prises et captures</a></li>
                        <li><a href="#castling" className="link">Le roque</a></li>
                        <li><a href="#en-passant" className="link">Prise en passant</a></li>
                        <li><a href="#promotion" className="link">Promotion du pion</a></li>
                        <li><a href="#check" className="link">Échec et mat</a></li>
                        <li><a href="#stalemate" className="link">Pat (stalemate)</a></li>
                        <li><a href="#draws" className="link">Nulles et règles de répétition</a></li>
                        <li><a href="#illegal" className="link">Coups illégaux</a></li>
                        <li><a href="#touch-move" className="link">Règle du toucher</a></li>
                        <li><a href="#clocks" className="link">Contrôles de temps</a></li>
                        <li><a href="#notation" className="link">La notation algébrique</a></li>
                        <li><a href="#etiquette" className="link">Étiquette et fair-play</a></li>
                        <li><a href="#resources" className="link">Ressources</a></li>
                    </ul>
                </nav>

                <section id="goal" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">But du jeu</h2>
                    <p>Le but des échecs est de mettre le roi adverse en "échec et mat" : c'est-à-dire
                        le placer sous attaque (échec) sans qu'il soit possible d'échapper à cette attaque
                        par un coup légal. Si le roi est en échec et qu'aucun coup légal ne peut supprimer
                        l'échec, la partie est terminée et le joueur dont le roi est mat perd la partie.</p>
                </section>

                <section id="pieces" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Les pièces et leurs déplacements</h2>

                    <h3 className="font-semibold">Pion</h3>
                    <p>Le pion avance d'une case vers l'avant (côté opposé), sauf lors de son premier mouvement
                        où il peut avancer de deux cases. Il capture en diagonale d'une case vers l'avant. Les
                        pions ne peuvent pas reculer. </p>

                    <h3 className="font-semibold">Cavalier</h3>
                    <p>Le cavalier se déplace en « L » : deux cases dans une direction (horizontale ou verticale)
                        puis une case perpendiculaire. Il est la seule pièce capable de sauter par-dessus d'autres
                        pièces.</p>

                    <h3 className="font-semibold">Fou</h3>
                    <p>Le fou se déplace d'un nombre quelconque de cases en diagonale. Chaque joueur commence
                        avec deux fous, un sur case claire et un sur case sombre.</p>

                    <h3 className="font-semibold">Tour</h3>
                    <p>La tour se déplace d'un nombre quelconque de cases horizontalement ou verticalement.
                        Elle joue un rôle essentiel dans les finales.</p>

                    <h3 className="font-semibold">Dame (Reine)</h3>
                    <p>La dame combine les mouvements de la tour et du fou : elle se déplace horizontalement,
                        verticalement ou diagonalement d'un nombre quelconque de cases.</p>

                    <h3 className="font-semibold">Roi</h3>
                    <p>Le roi se déplace d'une case dans toutes les directions. Le roi est la pièce la plus importante
                        : si elle est capturée (échec et mat), la partie est terminée.</p>
                </section>

                <section id="capture" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Prises et captures</h2>
                    <p>Une pièce capture une pièce adverse en atterrissant sur sa case selon son mouvement légal.
                        La pièce capturée est retirée de l'échiquier. Les seules exceptions sont les situations
                        particulières comme la prise en passant (voir plus bas) et la promotion.</p>
                </section>

                <section id="castling" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Le roque</h2>
                    <p>Le roque est un coup spécial impliquant le roi et une tour. Il existe deux types de roque :</p>
                    <ul className="list-inside list-disc">
                        <li><strong>Roque côté roi (petit roque)</strong> : le roi avance de deux cases vers la tour
                            et la tour rejoint la case immédiatement à côté du roi.</li>
                        <li><strong>Roque côté dame (grand roque)</strong> : le roi avance de deux cases vers la tour
                            et la tour se place de l'autre côté du roi.</li>
                    </ul>
                    <p>Conditions pour roquer :</p>
                    <ul className="list-inside list-disc">
                        <li>Ni le roi ni la tour impliquée ne doivent avoir bougé auparavant.</li>
                        <li>Il ne doit y avoir aucune pièce entre le roi et la tour.</li>
                        <li>Le roi ne doit pas être en échec au moment du roque, et il ne doit pas traverser ni atterrir
                            sur une case contrôlée par une pièce adverse.</li>
                    </ul>
                </section>

                <section id="en-passant" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Prise en passant</h2>
                    <p>La prise en passant est une capture spéciale du pion qui s'applique quand un pion avance de deux
                        cases depuis sa position initiale et se retrouve à côté d'un pion adverse. L'adversaire peut
                        capturer ce pion « comme s'il avait avancé d'une seule case » au coup immédiatement suivant.
                        Si le joueur ne réalise pas la prise immédiatement, l'opportunité disparaît.</p>
                </section>

                <section id="promotion" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Promotion du pion</h2>
                    <p>Quand un pion atteint la dernière rangée (côté opposé), il est promu et doit être remplacé par
                        une dame, une tour, un fou ou un cavalier du même camp. La promotion est obligatoire et la
                        pièce choisie remplace immédiatement le pion. Dans la majorité des parties, la dame est
                        choisie (promotion en dame), mais la promotion stratégique en cavalier existe également.</p>
                </section>

                <section id="check" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Échec et mat</h2>
                    <p><strong>Échec</strong> : lorsque le roi est attaqué par au moins une pièce adverse. Le joueur
                        en échec doit jouer un coup qui élimine l'échec (déplacer le roi, interposer une pièce,
                        ou capturer la pièce attaquante).</p>
                    <p><strong>Mat</strong> : si le roi est en échec et qu'aucun coup légal ne permet d'en sortir,
                        c'est un échec et mat et la partie est terminée (défaite du camp en échec).</p>
                </section>

                <section id="stalemate" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Pat (stalemate)</h2>
                    <p>Le pat survient lorsqu'un joueur n'a aucun coup légal et que son roi n'est pas en échec.
                        Dans ce cas la partie est déclarée nulle (égalité).</p>
                </section>

                <section id="draws" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Nulles et autres règles de fin de partie</h2>

                    <h3 className="font-semibold">Répétition de position (trois fois)</h3>
                    <p>Si la même position apparaît trois fois avec le même joueur au trait et les mêmes possibilités
                        (même droit de roquer, mêmes possibilités de prise en passant), un joueur peut réclamer la
                        nulle. La répétition n'a pas besoin d'être consécutive.</p>

                    <h3 className="font-semibold">Règle des 50 coups</h3>
                    <p>Si pendant 50 coups consécutifs par chaque joueur (50 coups de blanc + 50 coups de noir = 100
                        demi-coups) aucun pion n'a été déplacé et aucune capture n'a eu lieu, un joueur peut réclamer
                        la nulle.</p>

                    <h3 className="font-semibold">Matériel insuffisant</h3>
                    <p>Si les deux camps n'ont pas assez de matériel pour mater (par exemple roi contre roi, roi contre
                        roi + fou, roi contre roi + cavalier), la partie est automatiquement déclarée nulle.</p>

                    <h3 className="font-semibold">Accord mutuel</h3>
                    <p>Les joueurs peuvent convenir d'une nulle à tout moment par accord mutuel.</p>
                </section>

                <section id="illegal" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Coups illégaux</h2>
                    <p>Un coup illégal est un coup qui n'est pas autorisé par les règles (par exemple déplacer
                        une pièce d'une manière non permise, ou laisser son roi en échec). Selon le règlement
                        et le contexte (partie amicale vs tournoi), un coup illégal peut entraîner la
                        correction du coup et/ou une pénalité.</p>
                </section>

                <section id="touch-move" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Règle du toucher (touch-move)</h2>
                    <p>Dans les parties jouées selon les règles classiques (notamment en tournoi), si un joueur
                        touche volontairement une de ses pièces alors il doit la jouer si elle a un coup légal.
                        Si le joueur touche une pièce adverse, il doit la capturer si un coup légal le permet.
                        Cette règle n'est généralement pas appliquée dans les parties rapides en ligne.</p>
                </section>

                <section id="clocks" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Contrôles de temps</h2>
                    <p>Les parties peuvent être jouées sans limite de temps (amicales) ou avec différentes cadences
                        : bullet, blitz, rapide, classique. Les formats de temps incluent souvent un incrément
                        (secondes ajoutées après chaque coup) ou un délai.</p>
                    <p>Si le temps d'un joueur expire, il perd la partie sauf si le camp adverse n'a pas suffisamment
                        de matériel pour mater (matériel insuffisant), auquel cas la partie est déclarée nulle.</p>
                </section>

                <section id="notation" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Notation algébrique</h2>
                    <p>La notation algébrique est le système standard pour enregistrer les coups. Chaque case a
                        une coordonnée (a1 jusqu'à h8). Un coup se note par la pièce (K, Q, R, B, N) suivie de
                        la case d'arrivée (ex: Nf3). Les pions sont notés uniquement par la case (ex: e4).
                        Les captures utilisent 'x' (ex: Rxd5). L'échec est souvent indiqué par '+' et le mat par '#'.</p>
                </section>

                <section id="etiquette" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Étiquette et fair-play</h2>
                    <p>Quelques bonnes pratiques :</p>
                    <ul className="list-inside list-disc">
                        <li>Ne pas chercher à tricher ni utiliser d'aide extérieure.</li>
                        <li>Respecter l'adversaire : pas d'insultes ni de commentaires déplacés.</li>
                        <li>Si tu dois t'absenter, informe ton adversaire si possible.</li>
                        <li>Rappelle-toi que l'objectif principal est de s'amuser et de s'améliorer.</li>
                    </ul>
                </section>

                <section id="tips" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Conseils pour débutants</h2>
                    <ul className="list-inside list-disc">
                        <li>Contrôle le centre (cases d4, e4, d5, e5).</li>
                        <li>Développe tes pièces rapidement et évite de déplacer la même pièce plusieurs fois
                            au début.</li>
                        <li>Rocker tôt pour sécuriser ton roi.</li>
                        <li>Évite les échanges inutiles quand tu as un avantage matériel.</li>
                        <li>Apprends quelques finales de base (roi + pion contre roi, tours, etc.).</li>
                    </ul>
                </section>

                <section id="resources" className="space-y-3 bg-base-100 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold">Ressources</h2>
                    <p>Pour approfondir :</p>
                    <ul className="list-inside list-disc">
                        <li><a href="https://fr.wikipedia.org/wiki/Règles_des_échecs" className="link" target="_blank" rel="noopener noreferrer">Règles des échecs - Wikipédia</a></li>
                        <li><a href="https://www.fide.com/fide/handbook.html?id=171&view=article" className="link" target="_blank" rel="noopener noreferrer">FIDE Laws of Chess</a></li>
                        <li><a href="https://www.chess.com/learn-how-to-play-chess" className="link" target="_blank" rel="noopener noreferrer">Learn How to Play Chess - Chess.com</a></li>
                        <li><a href="https://lichess.org/learn#/" className="link" target="_blank" rel="noopener noreferrer">Lichess Learning Resources</a></li>
                    </ul>
                </section>

            </div>

            <Footer />
        </main>
    );
}

