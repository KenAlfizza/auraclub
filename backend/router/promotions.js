// Express router
const express = require('express');
const router = express.Router();

// PrismaClient
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware: Authenticate
const authenticate = require('../middleware/authenticate');
// Middleware: Check Clearance
const checkClearance = require('../middleware/checkClearance');


// Create new promotions
router.post('/', authenticate, checkClearance('manager'), async (req, res) => {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[\+\-]\d{2}:\d{2})$/;

    const name = req.body.name;
    const description = req.body.description;
    const type = req.body.type = 'one-time' ? 'onetime' : req.body.type;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const minSpending = req.body.minSpending;
    const rate = req.body.rate;
    const points = req.body.points;

    if (!name || !description || !type || !startTime || !endTime) {
        return res.status(400).json({message:"Missing required fields"})
    }

    // Check start and end times are valid
    // ISO 8601 validation
    if (!iso8601Regex.test(startTime) || !iso8601Regex.test(endTime)) {
        return res.status(400).json({ message: 'startTime and endTime must be in ISO 8601 format.' });
    }
    // Value is valid
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start < now) return res.status(400).json({ message: 'startTime must not be in the past.' });
    if (end <= start) return res.status(400).json({ message: 'endTime must be after startTime.' });

    // Check minSpending is valid
    if (minSpending !== undefined && (typeof minSpending !== 'number' || minSpending < 0)) {
        return res.status(400).json({ message: 'minSpending must be positive numeric value' });
    }
    // Check rate is valid
    if (rate !== undefined && (typeof rate !== 'number' || rate < 0)) {
        return res.status(400).json({ message: 'rate must be positive numeric value' });
    }

    // Check points is valid
    if (points !== undefined && (typeof points !== 'number' || points < 0)) {
        return res.status(400).json({ message: 'points must be positive integer value' });
    }

    try {
        const promotion = await prisma.promotion.create({
                data: {
                    name,
                    description,
                    type,
                    startTime: start,
                    endTime: end,
                    minSpending,
                    rate,
                    points
                }
            });
        const result = {
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            type: promotion.type = 'onetime' ? 'one-time' : promotion.type,
            startTime: promotion.startTime,
            endTime: promotion.endTime,
            minSpending: promotion.minSpending,
            rate: promotion.rate,
            points: promotion.points
        };

        return res.status(201).json(result)
    } catch (err) {
        console.error('Error creating promotion', err);
        return res.status(500).json({message:'Internal server error'})
    }
});

// Get promotions
router.get("/", authenticate, async (req, res) => {
    const name = req.query.name;
    const type = req.query.type;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const started = req.query.started;
    const ended = req.query.ended;
    
    // Pagination
    if (typeof page !== 'number' || page < 1) {
        return res.status(400).json({message:"Page number must be positive integer"})
    }

    if (typeof limit !== 'number' || limit < 1) {
        return res.status(400).json({message:"Limit number must be positive integer"})
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;
    
    // AttributeFilter
    const attributeFilter = {};
    // Filter by name
     if (name) {
        attributeFilter.name = { contains: name, mode: 'insensitive' };
    }
    // Filter by type
    if (type) {
        attributeFilter.type = type;
    }

    const now = new Date();

    if (req.user.role === "regular") {
        // Regular users only see active promotions
        attributeFilter.startTime = { lte: now };
        attributeFilter.endTime = { gte: now };
    } else {
        // Check if the promotion started and ended combination is valid
        if (started !== undefined && ended !== undefined) {
            if (started === ended) {
                return res.status(400).json({message: "Promotion cannot be both started and ended"})
            }
        }
        // Managers and superuser
        if (started !== undefined) {
            if (started === 'true') {
                // Filter the promotion
                // Obtain promotion with start time before the current time
                attributeFilter.startTime = { lte: now };
                // Obtain promotion with end time after the current time
                attributeFilter.endTime = {gte: now}
            } else {
                attributeFilter.startTime = { gt: now };
            }
        }
        if (ended !== undefined) {
            if (ended === 'true') {
                attributeFilter.endTime = { lte: now };
            } else {
                attributeFilter.endTime = { gt: now };
            }
        }
    }

    try {
        // Prisma commands to fetch promotions
        const [count, promotions] = await prisma.$transaction([
            prisma.promotion.count({ where: attributeFilter }),
            prisma.promotion.findMany({
                where: attributeFilter,
                skip,
                take: limitNum,
                select: {
                    id: true,
                    name: true,
                    type: true,
                    startTime: true,
                    endTime: true,
                    minSpending: true,
                    rate: true,
                    points: true
                }
            }),
        ]);

        // Output the result to response
        const results = promotions.map(promo => ({
            id: promo.id,
            name: promo.name,
            type: promo.type,
            startTime: promo.startTime,
            endTime: promo.endTime,
            minSpending: promo.minSpending,
            rate: promo.rate,
            points: promo.points
        }));

        return res.status(200).json({ count, results });
    } catch (err) {
        console.error('Error fetching user', err);
        return res.status(500).json({message:'Internal server error'})
    }
});

// Retrieve a single promotion
router.get('/:promotionId', authenticate, checkClearance('regular'), async (req, res) => {
    const promotionId = parseInt(req.params.promotionId);

    // Check if ID is valid
    if (isNaN(promotionId)) {
        return res.status(404).json({ message: "Promotion not found" });
    }

    try {
        const promo = await prisma.promotion.findUnique({
            where: { id: promotionId }
        });

        // Check if promotion exists
        if (!promo) {
            return res.status(404).json({ message: "Promotion not found" });
        }

        const now = new Date();
        
        // Regular users can only see active promotions
        if (req.user.role === "regular") {
            if (promo.startTime > now || now > promo.endTime) {
                return res.status(404).json({ message: "Promotion not found" });
            }
        }

        // Return promotion details
        const result = {
            id: promo.id,
            name: promo.name,
            description: promo.description,
            type: promo.type,
            startTime: promo.startTime,
            endTime: promo.endTime,
            minSpending: promo.minSpending,
            rate: promo.rate,
            points: promo.points
        };
        
        return res.status(200).json(result);

    } catch (err) {
        console.error("Error retrieving promo", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Update promotion info
router.patch('/:promotionId', authenticate, checkClearance('manager'), async (req, res) => {
    const promotionId = parseInt(req.params.promotionId);
    const {
        name,
        description,
        type,
        startTime,
        endTime,
        minSpending,
        rate,
        points,
    } = req.body;

    try {
        const promotion = await prisma.promotion.findUnique({
            where: {id : promotionId}
        })
        if (!promotion) return res.status(404).json({message:"Promotion not found"});
        
        // The promo dates
        const now = new Date();
        const start = new Date(promotion.startTime);
        const end = new Date(promotion.endTime);

        // Check if promotion has started or ended
        const started = now >= start;
        const ended = now >= end;

        // Prevent updates when the start time has passed
        if (started) {
            if (name !== undefined || description !== undefined || type !== undefined || startTime !== undefined || minSpending !== undefined || rate !== undefined || points !== undefined) {
                return res.status(400).json({message: "Cannot update ongoing promotions"});
            }
        }

        // Prevent updating endTime after promo ended
        if (ended && endTime !== undefined) {
            return res.status(400).json({ message: "Cannot update endTime after promotion ends" });
        }

        // Attributes to update
        updatedAttributes = {}
        
        // Input checks - Check for undefined instead of truthy
        if (name !== undefined) {
            updatedAttributes.name = name;
        }
        if (description !== undefined) {
            updatedAttributes.description = description;
        }
        // Check type is valid
        if (type !== undefined) {
            if (type !== "automatic" && type !== "one-time") {
                return res.status(400).json({ message: 'Type can only be "automatic" or "one-time"'});
            }
            updatedAttributes.type = type === "one-time" ? "onetime" : type;
        }
        
        // Check startTime is valid
        if (startTime !== undefined) {
            const newStart = new Date(startTime);
            
            // Determine the End Time to check against ---
            // If client provided new endTime, use it (it will be set in updatedAttributes later).
            // Otherwise, use the promotion's original endTime.
            const refEnd = endTime ? new Date(endTime) : end; // 'end' is the original promotion.endTime

            if (isNaN(newStart.getTime())) {
                return res.status(400).json({ message: "Invalid startTime" });
            }
            if (newStart.getTime() < now.getTime()) {
                return res.status(400).json({ message: "startTime cannot be in the past" });
            }
            
            // Check if the new startTime is on or after the reference end time
            if (newStart.getTime() >= refEnd.getTime()) {
                return res.status(400).json({ 
                    message: "startTime must be before endTime" 
                });
            }
            updatedAttributes.startTime = newStart;
        }
        
        // Check endTime is valid
        if (endTime !== undefined) {
            const newEnd = new Date(endTime);
            // Use updated startTime if provided, otherwise use original start
            // Note: Assuming 'start' is the original promotion's startTime (a Date object)
            const startRef = updatedAttributes.startTime || start; 
            
            // 1. Check for valid date format
            if (isNaN(newEnd.getTime())) {
                return res.status(400).json({ message: "Invalid endTime format" });
            }

            // 2. Check that endTime is after startTime
            if (newEnd <= startRef) { // Requires end time to be strictly > start time
                return res.status(400).json({ message: "endTime must be after startTime" });
            }

            // 3. Check that endTime is not in the past
            const now = new Date();
            if (newEnd < now) {
                return res.status(400).json({ message: "endTime cannot be in the past" });
            }
            updatedAttributes.endTime = newEnd;
        }

        // Check minSpending is valid
        if (minSpending !== undefined) {
            if (typeof minSpending !== 'number' || minSpending < 0) {
                return res.status(400).json({ message: 'minSpending must be positive numeric value' });
            } else {
                updatedAttributes.minSpending = minSpending;
            }
        } 
        
        // Check rate is valid
        if (rate !== undefined) { 
            if (typeof rate !== 'number' || rate < 0) {
                return res.status(400).json({ message: 'rate must be positive numeric value' });
            } else {
                updatedAttributes.rate = rate;
            }
        }
        
        // Check points is valid
        if (points !== undefined) {
            if (!Number.isInteger(points) || points < 0) {
                return res.status(400).json({ message: 'points must be positive integer value' });
            } else {
                updatedAttributes.points = points;
            }
        }

        // Check if any field is updated
        if (Object.keys(updatedAttributes).length === 0) {
            return res.status(400).json({ message: 'No fields to update.' });
        }
        
        // Prisma command to update the promotion
        const updatedPromotion = await prisma.promotion.update({
            where: {id: promotionId},
            data: updatedAttributes,
        });

        // Result containing updatedPromotion
        const result = {
            id: updatedPromotion.id,
            name: updatedPromotion.name,
            type: updatedPromotion.type,
        };

        // Include only updated fields (excluding id, name, type which are always included)
        for (const attribute of Object.keys(updatedAttributes)) {
            if (attribute !== 'id' && attribute !== 'name' && attribute !== 'type') {
                result[attribute] = updatedPromotion[attribute];
            }
        }
        return res.json(result);

    } catch (err) {
        console.error('Error updating promotion', err);
        return res.status(500).json({message:'Internal server error'})
    }    
});

// Delete promotions
router.delete('/:promotionId', authenticate, checkClearance('manager'), async (req, res) => {
    const promotionId = parseInt(req.params.promotionId);
    
    try {
        const promotion = await prisma.promotion.findUnique({
            where: { id: promotionId }
        });
        
        if (!promotion) {
            return res.status(404).json({ message: "Promotion not found" });
        }
        
        // Check if promotion has already started
          const now = new Date();
        const startTime = new Date(promotion.startTime);
        
        // Validate dates are valid
        if (isNaN(startTime.getTime())) {
            return res.status(500).json({ message: "Invalid promotion start time" });
        }
        
        // Check if promotion has started
        if (now >= startTime) {
            return res.status(403).json({ message: "Cannot delete promotion that has already started" });
        }
        
        // Delete the promotion
        await prisma.promotion.delete({
            where: { id: promotionId }
        });
        
        return res.status(204).send();
        
    } catch (err) {
        console.error('Error deleting promotion', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;