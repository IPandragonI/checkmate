import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();
const p = prisma as any;

async function seedBots() {
    if (await p.bot.count() > 0) {
        console.log("Bots already seeded");
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
    console.log(`Seeded ${bots.length} bots`);
}

async function seedPuzzles() {
    await p.puzzle.deleteMany({});

    const puzzles = [
        {
            number: 1,
            startFen: "1q1r3k/3Q2p1/7p/8/8/7P/4RPP1/6K1 w - - 0 1",
            solution: [
                { from: "d7", to: "f7" },
                { from: "d8", to: "d1" }
            ],
            difficulty: 1
        }, {
            number: 2,
            startFen: "2b1r3/Q1bk1ppp/8/1N1p4/1P6/8/P3KPP1/2R1R2q w - - 0 1",
            solution: [
                { from: "e2", to: "f3" },
                { from: "h1", to: "h5" }
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
