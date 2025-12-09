// prisma/clear.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing database...");

  // Order matters because of foreign key constraints
  await prisma.userPoints.deleteMany({});
  await prisma.eventRSVP.deleteMany({});
  await prisma.eventGuest.deleteMany({});
  await prisma.eventOrganizer.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.promotion.deleteMany({});
  await prisma.resetToken.deleteMany({});
  await prisma.loginToken.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database cleared!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
