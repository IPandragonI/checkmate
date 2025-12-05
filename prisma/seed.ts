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

async function main() {
    await seedBots();
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
