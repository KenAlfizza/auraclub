// utils/points.js
const { PrismaClient } = require('@prisma/client');

// Create a single Prisma client instance
const prisma = new PrismaClient();

/**
 * Save a snapshot of user's points
 * @param {number} userId - ID of the user
 * @param {number} points - user's current points
 */
async function savePointsSnapshot(userId, points) {
  if (!userId) throw new Error("Missing userId");
  if (points === undefined) throw new Error("Missing points value");

  return prisma.userPoints.create({
    data: {
      userId,
      points,
      date: new Date(),
    },
  });
}

module.exports = savePointsSnapshot;
