import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();
const p = prisma as any;

async function seedBots() {
    const existingBots = await p.bot.count();
    if (existingBots > 0) {
        console.log("Bots already seeded, skipping.");
        return;
    }

    const bots = [
        {username: "Bob", label: "Facile", elo: 400, img: "/bot/bob.svg"},
        {username: "Ethan", label: "Moyen", elo: 800, img: "/bot/ethan.svg"},
        {username: "Sophia", label: "Avancé", elo: 1400, img: "/bot/sophia.svg"},
        {username: "Magnus", label: "Impossible", elo: 2000, img: "/bot/magnus.svg"}
    ];

    for (const bot of bots) {
        await p.bot.upsert({
            where: {username: bot.username},
            update: bot,
            create: bot
        });
    }
}

async function seedPuzzles() {
    const existingPuzzles = await p.puzzle.count();
    if (existingPuzzles > 0) {
        console.log("Puzzles already seeded, skipping.");
        return;
    }

    const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    // 20 varied puzzles: solutions are arrays of moves {from,to,promotion?}
    const puzzles = [
        // 1) Scholar's mate (classic)
        {
            number: 1,
            startFen: START_FEN,
            solution: [
                { from: 'e2', to: 'e4' },
                { from: 'e7', to: 'e5' },
                { from: 'd1', to: 'h5' },
                { from: 'b8', to: 'c6' },
                { from: 'f1', to: 'c4' },
                { from: 'g8', to: 'f6' },
                { from: 'h5', to: 'f7' }
            ],
            difficulty: 1
        },
        // 2) Fool's mate
        {
            number: 2,
            startFen: START_FEN,
            solution: [
                { from: 'f2', to: 'f3' },
                { from: 'e7', to: 'e5' },
                { from: 'g2', to: 'g4' },
                { from: 'd8', to: 'h4' }
            ],
            difficulty: 1
        },
        // 3) Back-rank mate theme (cut escape squares)
        {
            number: 3,
            startFen: '6k1/5ppp/8/8/8/8/5PPP/6K1 w - - 0 1',
            solution: [
                { from: 'f1', to: 'g1' },
                { from: 'g8', to: 'h8' },
                { from: 'g1', to: 'g8' }
            ],
            difficulty: 2
        },
        // 4) Knight fork tactic
        {
            number: 4,
            startFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
            solution: [
                { from: 'f3', to: 'g5' },
                { from: 'c6', to: 'd4' },
                { from: 'g5', to: 'f7' }
            ],
            difficulty: 2
        },
        // 5) Simple discovered attack
        {
            number: 5,
            startFen: 'rnbqk2r/pppp1ppp/5n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 1',
            solution: [
                { from: 'c4', to: 'f7' }
            ],
            difficulty: 2
        },
        // 6) Capture to win material
        {
            number: 6,
            startFen: 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 1',
            solution: [
                { from: 'c4', to: 'f7' },
                { from: 'e8', to: 'f7' }
            ],
            difficulty: 2
        },
        // 7) Mate with queen and rook (basic combination)
        {
            number: 7,
            startFen: 'rnb1k2r/ppp2ppp/3b1n2/3p4/3P4/2N1PN2/PPP2PPP/R1BQKB1R w KQkq - 0 1',
            solution: [
                { from: 'e1', to: 'c1' },
                { from: 'd8', to: 'd7' },
                { from: 'c1', to: 'c7' }
            ],
            difficulty: 3
        },
        // 8) Pin and win
        {
            number: 8,
            startFen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 1',
            solution: [
                { from: 'c4', to: 'f7' },
                { from: 'e8', to: 'f7' },
                { from: 'f1', to: 'c4' }
            ],
            difficulty: 3
        },
        // 9) Double attack
        {
            number: 9,
            startFen: 'rnbqkbnr/ppp2ppp/3p4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
            solution: [
                { from: 'c4', to: 'f7' },
                { from: 'e8', to: 'f7' },
                { from: 'f3', to: 'g5' }
            ],
            difficulty: 3
        },
        // 10) Clear out king's defenses
        {
            number: 10,
            startFen: 'r3k2r/ppp2ppp/2n5/3q4/3P4/2N5/PPP2PPP/R1BQ1RK1 w kq - 0 1',
            solution: [
                { from: 'd1', to: 'e1' },
                { from: 'd5', to: 'd4' },
                { from: 'e1', to: 'e7' }
            ],
            difficulty: 4
        },
        // 11) Skewer tactic
        {
            number: 11,
            startFen: 'r1bq1rk1/pp1n1ppp/2p1pn2/3p4/3P4/2N1PN2/PPQ2PPP/2R1KB1R w - - 0 1',
            solution: [
                { from: 'c2', to: 'b3' },
                { from: 'd5', to: 'd4' },
                { from: 'c3', to: 'd5' }
            ],
            difficulty: 4
        },
        // 12) Decoy tactic
        {
            number: 12,
            startFen: 'r3r1k1/ppq2ppp/2n2n2/3p4/3P4/2N1PN2/PPQ2PPP/2R2RK1 w - - 0 1',
            solution: [
                { from: 'c2', to: 'c6' },
                { from: 'b7', to: 'c6' },
                { from: 'c1', to: 'c6' }
            ],
            difficulty: 4
        },
        // 13) Removing defender
        {
            number: 13,
            startFen: 'r1bq1rk1/ppp2ppp/2n2n2/3p4/3P4/2N1PN2/PPPQ1PPP/R3KB1R w KQ - 0 1',
            solution: [
                { from: 'd2', to: 'b4' },
                { from: 'd8', to: 'd6' },
                { from: 'b4', to: 'c5' }
            ],
            difficulty: 4
        },
        // 14) Mate net
        {
            number: 14,
            startFen: '6k1/5ppp/8/8/2Q5/8/5PPP/6K1 w - - 0 1',
            solution: [
                { from: 'c4', to: 'g8' }
            ],
            difficulty: 2
        },
        // 15) Promotion tactic (endgame)
        {
            number: 15,
            startFen: '8/4P3/8/8/8/8/6k1/6K1 w - - 0 1',
            solution: [
                { from: 'e7', to: 'e8', promotion: 'q' }
            ],
            difficulty: 3
        },
        // 16) Simple mate in 2
        {
            number: 16,
            startFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
            solution: [
                { from: 'c4', to: 'f7' },
                { from: 'e8', to: 'f7' },
                { from: 'f1', to: 'c4' }
            ],
            difficulty: 3
        },
        // 17) Queen trap
        {
            number: 17,
            startFen: 'rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1',
            solution: [
                { from: 'd1', to: 'h5' },
                { from: 'e5', to: 'd4' },
                { from: 'h5', to: 'e5' }
            ],
            difficulty: 3
        },
        // 18) Rook infiltration tactic
        {
            number: 18,
            startFen: 'r4rk1/pp1n1ppp/2p1b3/3p4/3P4/2N1PN2/PP3PPP/R1B2RK1 w - - 0 1',
            solution: [
                { from: 'f1', to: 'e1' },
                { from: 'f8', to: 'e8' },
                { from: 'e1', to: 'e7' }
            ],
            difficulty: 4
        },
        // 19) Discovered check leading to mate
        {
            number: 19,
            startFen: 'r1bq1rk1/ppppnppp/2n5/4p3/3P4/2N1PN2/PPPQ1PPP/R1B2RK1 w - - 0 1',
            solution: [
                { from: 'c1', to: 'a3' },
                { from: 'e5', to: 'e4' },
                { from: 'a3', to: 'e7' }
            ],
            difficulty: 5
        },
        // 20) Endgame mate pattern
        {
            number: 20,
            startFen: '6k1/6pp/8/8/8/8/5PPP/6K1 w - - 0 1',
            solution: [
                { from: 'g2', to: 'g3' },
                { from: 'g7', to: 'g6' },
                { from: 'g3', to: 'g4' }
            ],
            difficulty: 1
        }
    ];

    for (const puzzle of puzzles) {
        await p.puzzle.create({data: puzzle});
    }
    console.log(`Seeded ${puzzles.length} puzzles`);
}

async function main() {
    await seedBots();
    await seedPuzzles();
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
