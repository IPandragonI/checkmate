import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const bots = [
    { name: "Bob", label: "Facile", elo: 400, img: "/bot/bob.svg" },
    { name: "Ethan", label: "Moyen", elo: 800, img: "/bot/ethan.svg" },
    { name: "Sophia", label: "Avancé", elo: 1400, img: "/bot/sophia.svg" },
    { name: "Magnus", label: "Impossible", elo: 2000, img: "/bot/magnus.svg" }
  ];

  for (const bot of bots) {
    await prisma.bot.upsert({
      where: { name: bot.name },
      update: bot,
      create: bot
    });
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
