/*
 * If you need to initialize your database with some data, you may write a script
 * to do so here.
 */
'use strict';
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ---- Users ----
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: `User ${i}`,
        email: `user${i}@example.com`,
        utorid: `utorid${i}`,
        birthday: new Date(1990, i % 12, i),
        role: i === 1 ? "superuser" : i === 2 ? "manager" : "regular",
        points: Math.floor(Math.random() * 1000),
        verified: i % 2 === 0,
      },
    });
    users.push(user);
  }

  // ---- Promotions ----
  const promotions = [];
  for (let i = 1; i <= 5; i++) {
    const promo = await prisma.promotion.create({
      data: {
        name: `Promo ${i}`,
        description: `This is promotion number ${i}`,
        type: i % 2 === 0 ? "automatic" : "onetime",
        startTime: new Date(),
        endTime: addDays(new Date(), 30),
        minSpending: i * 10,
        points: i * 50,
        rate: i % 2 === 0 ? 0.1 : undefined,
      },
    });
    promotions.push(promo);
  }

  // ---- Events ----
  const events = [];
  for (let i = 1; i <= 3; i++) {
    const event = await prisma.event.create({
      data: {
        name: `Event ${i}`,
        description: `This is event number ${i}`,
        location: `Location ${i}`,
        startTime: addDays(new Date(), i),
        endTime: addDays(new Date(), i + 1),
        capacity: 50 + i * 10,
        pointsTotal: 100 * i,
        pointsRemain: 100 * i,
        published: i % 2 === 0,
      },
    });
    events.push(event);
  }

  // ---- Event Organizers and Guests ----
  for (const event of events) {
    await prisma.eventOrganizer.create({
      data: {
        eventId: event.id,
        userId: users[0].id, // first user as organizer
      },
    });

    await prisma.eventGuest.createMany({
      data: users.slice(1, 6).map((user) => ({
        eventId: event.id,
        userId: user.id,
      })),
      skipDuplicates: true,
    });
  }

  // ---- Transactions ----
  for (const user of users) {
    const transaction = await prisma.transaction.create({
      data: {
        type: "purchase",
        amount: Math.floor(Math.random() * 500),
        spent: Math.random() * 100,
        userId: user.id,
        createdById: users[0].id, // superuser created
        processedById: users[1].id, // manager processed
        promotions: { connect: [{ id: promotions[0].id }] },
        remark: "Sample transaction",
      },
    });
  }

  // ---- UserPoints snapshots ----
  for (const user of users) {
    await prisma.userPoints.createMany({
      data: Array.from({ length: 5 }).map((_, i) => ({
        userId: user.id,
        points: Math.floor(Math.random() * 100),
        date: addDays(new Date(), -i),
      })),
    });
  }

  console.log("Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
