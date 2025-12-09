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

    return res.status(201).json(event);
  } catch (err) {
    console.error("Error creating event:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /events
router.get("/", authenticate, checkClearance("regular"), async (req, res) => {
  try {
    const userRole = req.user.role;
    const { 
      name, 
      location, 
      started, 
      ended, 
      published,   // Managers only
      page = 1, 
      limit = 10,
      status, 
    } = req.query;

    const filters = {};
    const now = new Date();

    // Status-based filters
    if (status === "upcoming") {
      filters.startTime = { gte: now };
    } else if (status === "ongoing") {
      filters.startTime = { lte: now };
      filters.endTime = { gte: now };
    } else if (status === "past") {
      filters.endTime = { lt: now };
    }

    // Regular users ONLY see published events
    if (CLEARANCE[userRole] < CLEARANCE.manager) {
      filters.published = true;

    // Managers/Admins can see everything + they can filter published/unpublished
    } else if (published !== undefined) {
      filters.published = published === "true";
    }

    // Optional filters
    if (name) filters.name = { contains: name, mode: "insensitive" };
    if (location) filters.location = { contains: location, mode: "insensitive" };
    if (started) filters.startTime = { gte: new Date(started) };
    if (ended) filters.endTime = { lte: new Date(ended) };

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    // Managers get organizer+guest visibility
    const include = CLEARANCE[userRole] >= CLEARANCE.manager
      ? { organizers: true, guests: true }
      : false;

    // Fetch data
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

    // Response transformation
    const mappedResults = events.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      location: e.location,
      startTime: e.startTime,
      endTime: e.endTime,
      capacity: e.capacity,

      // Managers only
      pointsTotal: CLEARANCE[userRole] >= CLEARANCE.manager ? e.pointsTotal : undefined,
      pointsRemain: CLEARANCE[userRole] >= CLEARANCE.manager ? e.pointsRemain : undefined,
      pointsAwarded: CLEARANCE[userRole] >= CLEARANCE.manager 
        ? e.pointsTotal - e.pointsRemain 
        : undefined,

      published: e.published,
      organizersCount: CLEARANCE[userRole] >= CLEARANCE.manager ? e.organizers.length : undefined,
      guestsCount: CLEARANCE[userRole] >= CLEARANCE.manager ? e.guests.length : undefined,
    }));

    return res.json({ count, results: mappedResults });
  } catch (err) {
    console.error("Error fetching events:", err);
    return res.status(500).json({ message: "Internal server error" });
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

    return res.json(response);
  } catch (err) {
    console.error("Error fetching event:", err);
    return res.status(500).json({ message: "Internal server error" });
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
    return res.json(updatedEvent);
  } catch (err) {
    console.error("Error updating event:", err);
    return res.status(500).json({ message: "Internal server error" });
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
    return res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    return res.status(500).json({ message: "Internal server error" });
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
router.post("/:eventId/organizers", authenticate, checkClearance("manager"), async (req, res) => {
  const eventId = Number(req.params.eventId);
  const { userId } = req.body;

  if (isNaN(eventId)) return res.status(400).json({ message: "Invalid event ID" });
  if (userId == null || !Number.isInteger(userId)) 
    return res.status(400).json({ message: "userId is required and must be an integer" });

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const event = await prisma.event.findUnique({ where: { id: eventId }, include: { organizers: true, guests: true } });
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.guests.some(g => g.userId === userId)) return res.status(400).json({ message: "User is a guest, remove first" });
    if (event.organizers.some(o => o.userId === userId)) return res.status(400).json({ message: "User is already an organizer" });

    await prisma.eventOrganizer.create({ data: { eventId, userId } });

    return res.status(201).json({ message: "Organizer added successfully", organizer: { id: user.id, name: user.name, utorid: user.utorid } });
  } catch (err) {
    console.error("Error adding organizer:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// DELETE /events/:eventId/organizers/:userId - Remove an organizer
router.delete("/:eventId/organizers/:userId", authenticate, checkClearance("manager"), async (req, res) => {
  const eventId = Number(req.params.eventId);
  const userId = Number(req.params.userId);

  if (isNaN(eventId) || !Number.isInteger(userId)) {
    return res.status(400).json({ message: "Invalid event ID or user ID" });
  }

  try {
    const organizer = await prisma.eventOrganizer.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found for this event" });
    }

    await prisma.eventOrganizer.delete({ where: { id: organizer.id } });

    return res.json({ message: "Organizer removed successfully" });
  } catch (err) {
    console.error("Error removing organizer:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// GET /events/:eventId/guests - Get all guests for an event
router.get("/:eventId/guests", authenticate, async (req, res) => {
  const eventId = Number(req.params.eventId);

  try {
    const guests = await prisma.eventGuest.findMany({
      where: { eventId },
      include: { user: true },
    });

    const formattedGuests = guests.map(g => ({
      id: g.id,
      utorid: g.user.utorid,
      name: g.user.name,
      attended: g.rsvp?.attended ?? false,
    }));

    return res.json({ guests: formattedGuests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch guests" });
  }
});

// POST /events/:eventId/guests — Add Guest
router.post("/:eventId/guests", authenticate, async (req, res) => {
  const eventId = Number(req.params.eventId);
  const { userId } = req.body;

  if (isNaN(eventId) || !Number.isInteger(userId)) {
    return res.status(400).json({ message: "Invalid event ID or user ID" });
  }

  try {
    // Check if the user is already a guest
    const existingGuest = await prisma.eventGuest.findFirst({
      where: { eventId, userId },
    });

    if (existingGuest) {
      return res.status(400).json({ message: "User is already a guest" });
    }

    // Create new guest
    const guest = await prisma.eventGuest.create({
      data: {
        eventId,
        userId,
      },
      include: {
        user: true,
      },
    });

    return res.json({
      id: guest.id,
      utorid: guest.user.utorid,
      name: guest.user.name,
    });
  } catch (err) {
    console.error("Error adding guest:", err);
    return res.status(500).json({ message: "Failed to add guest" });
  }
});


// DELETE /events/:eventId/guests/:guestId - Remove guest
router.delete("/:eventId/guests/:guestId", authenticate, checkClearance("organizer"), async (req, res) => {
  const eventId = Number(req.params.eventId);
  const userId = Number(req.params.guestId);

  try {
    await prisma.eventGuest.delete({
      where: { eventId_userId: { eventId, userId } },
    });

    res.json({ message: "Guest removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove guest" });
  }
});


// GET /events/:eventId/rsvps - Get all RSVPs for an event
router.get("/:eventId/rsvps", authenticate, async (req, res) => {
  const eventId = Number(req.params.eventId);

  try {
    const rsvps = await prisma.eventRSVP.findMany({
      where: { eventId },
      include: { user: true },
    });

    const formatted = rsvps.map(r => ({
      id: r.id,
      userId: r.userId,
      utorid: r.user.utorid,
      name: r.user.name,
      attended: r.attended,
      status: r.status,
    }));

    return res.json({ rsvps: formatted });
  } catch (err) {
    console.error("Failed to fetch RSVPs:", err);
    return res.status(500).json({ message: "Failed to fetch RSVPs" });
  }
});

// POST /events/:eventId/rsvps - RSVP a user
router.post("/:eventId/rsvps", authenticate, async (req, res) => {
  const eventId = Number(req.params.eventId);
  const { userId } = req.body;

  if (!Number.isInteger(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const rsvp = await prisma.eventRSVP.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId, status: true, attended: false },
      update: { status: true },
      include: { user: true },
    });

    return res.json({
      id: rsvp.id,
      userId: rsvp.userId,
      utorid: rsvp.user.utorid,
      name: rsvp.user.name,
      attended: rsvp.attended,
      status: rsvp.status,
    });
  } catch (err) {
    console.error("Failed to RSVP:", err);
    return res.status(500).json({ message: "Failed to RSVP" });
  }
});


// DELETE /events/:eventId/rsvps - Cancel a user's RSVP
router.delete("/:eventId/rsvps",
  authenticate,
  checkClearance("organizer"),
  async (req, res) => {
    const eventId = Number(req.params.eventId);
    const { userId } = req.body;

    if (!Number.isInteger(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    try {
      const deleted = await prisma.eventRSVP.deleteMany({
        where: { eventId, userId },
      });

      if (deleted.count === 0) {
        return res.status(404).json({ message: "User is not RSVP'd" });
      }

      return res.json({ message: "RSVP cancelled" });
    } catch (err) {
      console.error("Error cancelling RSVP:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);


// POST /events/:eventId/rsvps/me - Self RSVP
router.post("/:eventId/rsvps/me", authenticate, async (req, res) => {
  const eventId = Number(req.params.eventId);
  const userId = req.user.id;

  try {
    const rsvp = await prisma.eventRSVP.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId, status: true, attended: false },
      update: { status: true },
      include: { user: true },
    });

    return res.json({
      id: rsvp.id,
      userId: rsvp.userId,
      name: rsvp.user.name,
      attended: rsvp.attended,
      status: rsvp.status,
    });
  } catch (err) {
    console.error("Self RSVP failed:", err);
    return res.status(500).json({ message: "Failed to RSVP" });
  }
});


// DELETE /events/:eventId/rsvps/me - Cancel self RSVP
router.delete("/:eventId/rsvps/me", authenticate, async (req, res) => {
  const eventId = Number(req.params.eventId);
  const userId = req.user.id;

  try {
    const deleted = await prisma.eventRSVP.deleteMany({
      where: { eventId, userId },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "No RSVP found" });
    }

    return res.json({ message: "RSVP cancelled" });
  } catch (err) {
    console.error("Failed to cancel RSVP:", err);
    return res.status(500).json({ message: "Failed to cancel RSVP" });
  }
});

// PATCH /events/:eventId/attendance - Mark attendance (convert RSVP to Guest)
router.patch(
  "/:eventId/guests",
  authenticate,
  checkClearance("organizer"),
  async (req, res) => {
    const eventId = Number(req.params.eventId);
    const { userId } = req.body;

    if (!Number.isInteger(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    try {
      // Check if user has RSVP
      const rsvp = await prisma.eventRSVP.findUnique({
        where: { eventId_userId: { eventId, userId } },
        include: { user: true },
      });

      if (!rsvp) {
        return res.status(404).json({ message: "User has not RSVP'd" });
      }

      // Remove RSVP
      await prisma.eventRSVP.delete({ where: { id: rsvp.id } });

      // Check if user is already a guest
      let guest = await prisma.eventGuest.findUnique({
        where: { eventId_userId: { eventId, userId } },
        include: { user: true },
      });

      if (guest) {
        // Already a guest → mark attended
        guest = await prisma.eventGuest.update({
          where: { id: guest.id },
          data: { attended: true },
          include: { user: true },
        });
      } else {
        // Not a guest → create guest with attended = true
        guest = await prisma.eventGuest.create({
          data: { eventId, userId },
          include: { user: true },
        });
      }

      return res.json({
        message: "User marked as attended and moved from RSVP to Guest",
        guest: {
          id: guest.id,
          utorid: guest.user.utorid,
          name: guest.user.name,
        },
      });
    } catch (err) {
      console.error("Failed to convert RSVP → Guest:", err);
      return res.status(500).json({ message: "Failed to mark attendance" });
    }
  }
);

// GET /events/me - Get all events the authenticated user has RSVP'd or attended
router.get("/me", authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch RSVPs
    const rsvps = await prisma.eventRSVP.findMany({
      where: { userId, status: true },
      include: { event: true },
    });

    // Fetch attended events (guests)
    const attended = await prisma.eventGuest.findMany({
      where: { userId, attended: true },
      include: { event: true },
    });

    // Map to a unified format
    const rsvpEvents = rsvps.map(r => ({
      id: r.event.id,
      name: r.event.name,
      description: r.event.description,
      location: r.event.location,
      startTime: r.event.startTime,
      endTime: r.event.endTime,
      status: "RSVP",
    }));

    const attendedEvents = attended.map(g => ({
      id: g.event.id,
      name: g.event.name,
      description: g.event.description,
      location: g.event.location,
      startTime: g.event.startTime,
      endTime: g.event.endTime,
      status: "ATTENDED",
    }));

    return res.json({
      rsvpEvents,
      attendedEvents,
    });
  } catch (err) {
    console.error("Failed to fetch user's events:", err);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
});


module.exports = router;
