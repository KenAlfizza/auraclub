// Express router
const express = require('express');
const router = express.Router();

// PrismaClient
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware: Authenticate
const authenticate = require('../middleware/authenticate');

// Save a snapshot of user points
router.post('/snapshot', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { points } = req.body;

    if (points == null) return res.status(400).json({ error: 'Points are required' });

    const snapshot = await prisma.userPoints.create({
      data: { userId, points },
    });

    res.status(201).json(snapshot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create snapshot' });
  }
});

// Get current user points
router.get('/current', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // set by authenticate middleware
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, points: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ id: user.id, name: user.name, points: user.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch current points' });
  }
});


// Get points trend for a user
router.get('/trend', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const trend = await prisma.userPoints.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
    });

    // Return in chronological order
    res.json(trend.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch points trend' });
  }
});


module.exports = router;