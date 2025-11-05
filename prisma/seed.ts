import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const bots = [
    { username: "Bob", label: "Facile", elo: 400, img: "/bot/bob.svg" },
    { username: "Ethan", label: "Moyen", elo: 800, img: "/bot/ethan.svg" },
    { username: "Sophia", label: "Avancé", elo: 1400, img: "/bot/sophia.svg" },
    { username: "Magnus", label: "Impossible", elo: 2000, img: "/bot/magnus.svg" }
  ];

  for (const bot of bots) {
    await prisma.bot.upsert({
      where: { username: bot.username },
      update: bot,
      create: bot
    });
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
