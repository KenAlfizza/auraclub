const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const authenticate = require("../middleware/authenticate");
const checkClearance = require("../middleware/checkClearance");

const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(.\d+)?(Z|([+-]\d{2}:\d{2}))$/;

const CLEARANCE = {
  regular: 1,
  organizer: 2,
  manager: 3,
  superuser: 4,
};

// POST /events
router.post("/", authenticate, checkClearance("manager"), async (req, res) => {
  const { name, description, location, startTime, endTime, capacity, pointsTotal, published } = req.body;

  if (!name || !location || !startTime || !endTime || pointsTotal == null) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!iso8601Regex.test(startTime) || !iso8601Regex.test(endTime)) {
    return res.status(400).json({ message: "Start and end time must be ISO 8601" });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (start < now) return res.status(400).json({ message: "Start time must not be in the past" });
  if (end <= start) return res.status(400).json({ message: "End time must be after start time" });

  if (capacity != null && (typeof capacity !== "number" || capacity <= 0)) {
    return res.status(400).json({ message: "Capacity must be a positive number or null" });
  }

  if (typeof pointsTotal !== "number" || pointsTotal <= 0) {
    return res.status(400).json({ message: "Points must be a positive number" });
  }

  if (description && description.length > 500) {
    return res.status(400).json({ message: "Description must be at most 500 characters" });
  }

  try {
    const event = await prisma.event.create({
      data: {
        name,
        description: description || null,
        location,
        startTime: start,
        endTime: end,
        capacity: capacity || null,
        pointsTotal,
        pointsRemain: pointsTotal,
        published: !!published,
      },
    });

    res.status(201).json(event);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /events
router.get("/", authenticate, checkClearance("regular"), async (req, res) => {
  try {
    const userRole = req.user.role;
    const { name, location, started, ended, published, page = 1, limit = 10 } = req.query;

    if (started && ended) {
      return res.status(400).json({ message: "Cannot specify both started and ended filters" });
    }

    const filters = {};

    if (CLEARANCE[userRole] < CLEARANCE.manager) {
      filters.published = true;
    } else if (published !== undefined) {
      filters.published = published === "true";
    }

    if (name) filters.name = { contains: name, mode: "insensitive" };
    if (location) filters.location = { contains: location, mode: "insensitive" };
    if (started) filters.startTime = { gte: new Date(started) };
    if (ended) filters.endTime = { lte: new Date(ended) };

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const include = CLEARANCE[userRole] >= CLEARANCE.manager
      ? { organizers: true, guests: true }
      : false;

    const [count, events] = await Promise.all([
      prisma.event.count({ where: filters }),
      prisma.event.findMany({
        where: filters,
        orderBy: { startTime: "asc" },
        take,
        skip,
        include,
      }),
    ]);

    const mappedResults = events.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      location: e.location,
      startTime: e.startTime,
      endTime: e.endTime,
      capacity: e.capacity,
      pointsTotal: CLEARANCE[userRole] >= CLEARANCE.manager ? e.pointsTotal : undefined,
      pointsRemain: CLEARANCE[userRole] >= CLEARANCE.manager ? e.pointsRemain : undefined,
      pointsAwarded: CLEARANCE[userRole] >= CLEARANCE.manager ? e.pointsTotal - e.pointsRemain : undefined,
      published: e.published,
      organizersCount: CLEARANCE[userRole] >= CLEARANCE.manager ? e.organizers.length : undefined,
      guestsCount: CLEARANCE[userRole] >= CLEARANCE.manager ? e.guests.length : undefined,
    }));

    res.json({ count, results: mappedResults });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /events/:eventId
router.get("/:eventId", authenticate, checkClearance("regular"), async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (isNaN(eventId)) return res.status(400).json({ message: "Invalid event ID" });

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organizers: true, guests: true },
    });

    if (!event) return res.status(404).json({ message: "Event not found" });

    const user = req.user;
    const isManager = CLEARANCE[user.role] >= CLEARANCE.manager;
    const isOrganizer = event.organizers.some(o => o.userId === user.id);

    if (!event.published && !isManager && !isOrganizer) {
      return res.status(404).json({ message: "Event not found" });
    }

    const response = {
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      startTime: event.startTime,
      endTime: event.endTime,
      capacity: event.capacity,
      published: event.published,
    };

    if (isManager || isOrganizer) {
      response.pointsTotal = event.pointsTotal;
      response.pointsRemain = event.pointsRemain;
      response.pointsAwarded = event.pointsTotal - event.pointsRemain;
      response.organizers = event.organizers.map(o => ({ id: o.id, utorid: o.utorid, name: o.name }));
      response.guests = event.guests.map(g => ({ id: g.id, utorid: g.utorid, name: g.name }));
    } else {
      response.organizersCount = event.organizers.length;
      response.guestsCount = event.guests.length;
    }

    res.json(response);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH /events/:eventId
router.patch("/:eventId", authenticate, checkClearance("organizer"), async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (isNaN(eventId)) return res.status(400).json({ message: "Invalid event ID" });

  const { name, description, location, startTime, endTime, capacity, points, published } = req.body;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organizers: true },
    });

    if (!event) return res.status(404).json({ message: "Event not found" });

    const user = req.user;
    const isManager = CLEARANCE[user.role] >= CLEARANCE.manager;
    const isOrganizer = event.organizers.some(o => o.userId === user.id);

    if (!isManager && !isOrganizer) return res.status(403).json({ message: "Forbidden" });

    const updateData = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (capacity != null) updateData.capacity = capacity;

    if (isManager) {
      if (points != null) {
        if (points < event.pointsTotal - event.pointsRemain) {
          return res.status(400).json({ message: "New pointsTotal cannot be less than awarded points" });
        }
        updateData.pointsTotal = points;
        updateData.pointsRemain = event.pointsRemain + (points - event.pointsTotal);
      }
      if (published != null) updateData.published = published;
    }

    const updatedEvent = await prisma.event.update({ where: { id: eventId }, data: updateData });
    res.json(updatedEvent);
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /events/:eventId
router.delete("/:eventId", authenticate, checkClearance("manager"), async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (isNaN(eventId)) return res.status(400).json({ message: "Invalid event ID" });

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.published) return res.status(400).json({ message: "Cannot delete a published event" });

    await prisma.event.delete({ where: { id: eventId } });
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all organizers
router.get(
  "/:eventId/organizers",
  authenticate,
  checkClearance("regular"),
  async (req, res) => {
    const eventId = Number(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organizers: { include: { user: true } },
        },
      });

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const organizers = event.organizers.map((o) => ({
        id: o.user.id,
        utorid: o.user.utorid,
        name: o.user.name,
      }));

      return res.json({ organizers });
    } catch (err) {
      console.error("Error fetching organizers:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// POST /events/:eventId/organizers - Add an organizer
router.post("/:eventId/organizers",
  authenticate,
  checkClearance("manager"), // Only manager or higher
  async (req, res) => {
    const eventId = Number(req.params.eventId);
    const { utorid } = req.body;

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    if (!utorid || typeof utorid !== "string") {
      return res.status(400).json({ message: "utorid is required" });
    }

    try {
      // Fetch the user
      const user = await prisma.user.findUnique({
        where: { utorid },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Fetch the event
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organizers: true,
          guests: true,
        },
      });

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const now = new Date();
      if (event.endTime < now) {
        return res.status(410).json({ message: "Event has already ended" });
      }

      // Check if user is a guest
      const isGuest = event.guests.some((g) => g.userId === user.id);
      if (isGuest) {
        return res
          .status(400)
          .json({ message: "User is currently a guest. Remove them first." });
      }

      // Check if already an organizer
      const isOrganizer = event.organizers.some((o) => o.userId === user.id);
      if (isOrganizer) {
        return res
          .status(400)
          .json({ message: "User is already an organizer of this event" });
      }

      // Add organizer
      const newOrganizer = await prisma.eventOrganizer.create({
        data: {
          eventId,
          userId: user.id,
        },
      });

      return res.status(201).json({
        message: "Organizer added successfully",
        organizer: {
          id: user.id,
          utorid: user.utorid,
          name: user.name,
        },
      });
    } catch (err) {
      console.error("Error adding organizer:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// DELETE /events/:eventId/organizers/:userId - Remove an organizer
router.delete(
  "/:eventId/organizers/:userId",
  authenticate,
  checkClearance("manager"), // Only manager or higher
  async (req, res) => {
    const eventId = Number(req.params.eventId);
    const userId = Number(req.params.userId);

    if (isNaN(eventId) || isNaN(userId)) {
      return res.status(400).json({ message: "Invalid event ID or user ID" });
    }

    try {
      // Check if organizer exists
      const organizer = await prisma.eventOrganizer.findUnique({
        where: {
            eventId_userId: {  
            eventId: eventId,
            userId: userId,
            },
        },
        });


      if (!organizer) {
        return res
          .status(404)
          .json({ message: "Organizer not found for this event" });
      }

      // Delete organizer
      await prisma.eventOrganizer.delete({
        where: { id: organizer.id },
      });

      return res.json({ message: "Organizer removed successfully" });
    } catch (err) {
      console.error("Error removing organizer:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
