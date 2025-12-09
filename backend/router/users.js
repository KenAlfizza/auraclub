// Express router
const express = require('express');
const router = express.Router();

// PrismaClient
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Brcypt
const bcrypt = require('bcrypt');

// Middleware: Authenticate
const authenticate = require('../middleware/authenticate');
// Middleware: Clearance Check
const checkClearance = require('../middleware/checkClearance');
// Middleware: Upload Avatar
const uploadAvatar = require('../middleware/uploadAvatar');

// Save points snapshot
const savePointsSnapshot = require('../utils/savePointsSnapshot');

// Register user
router.post("/", authenticate, checkClearance('cashier'), async (req, res) => {
    const utorid = req.body.utorid;
    const name = req.body.name;
    const email = req.body.email;

    if (!utorid || !name || !email) {
        return res.status(400).json({message: "Invalid payload"});
    }

    if (utorid.length < 7 || utorid.length > 8 || !/^[a-z0-9]+$/.test(utorid)) {
        return res.status(400).json({message: "utorid must be between 7 and 8 characters and alphanumeric lowercase"});
    }
    if (name.length < 1 || name.length > 50) {
        return res.status(400).json({message: "name must be between 1-50 characters"});
    }
    if (!email.endsWith("@mail.utoronto.ca")) {
        return res.status(400).json({message: "Email must be valid UofT address"});
    }

    try {
        // Check if user exists
        const userExists = await prisma.user.findFirst({
            where: {utorid: utorid},
        })

        if (userExists) return res.status(409).json({message: "User already exists"});

        // Create user
        const user = await prisma.user.create({
            data: {
                utorid: utorid,
                name: name,
                email: email,
                avatarUrl: '/uploads/avatars/avatar_default.png'
            },
        });

        // Call reset token service
        const { createResetToken } = require("../services/resetTokenService");
        const { resetToken, resetTokenExpiresAt } = await createResetToken(user);

        // Return the response
        return res.status(201).json({
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            verified: user.verified,
            expiresAt: resetTokenExpiresAt,
            resetToken: resetToken
        });
        
    } catch (err) {
        console.error("Error creating user:", err);
        return res.status(500).json({message:'Internal server error'})
    }
});

// Retrieve a list of users
router.get("/", authenticate, checkClearance('manager'), async (req, res) => {    
    const attibuteComparisons = {};

    // Filter by name (matches utorid OR name)
    if (req.query.name) {
        const nameFilter = req.query.name;
        attibuteComparisons.OR = [
            { name: { contains: nameFilter, mode: "insensitive" } },
            { utorid: { contains: nameFilter, mode: "insensitive" } },
        ];
    }

    // Filter by role
    if (req.query.role) {
        attibuteComparisons.role = req.query.role;
    }

    // Filter by verified
    if (req.query.verified != null) {
        let verified = req.query.verified;

        // Normalize to string values "true" or "false"
        if (verified === true) verified = "true";
        if (verified === false) verified = "false";

        // Validate
        if (verified !== "true" && verified !== "false") {
            return res.status(400).json({ error: "verified must be a boolean value" });
        }

        // Convert to actual boolean
        attibuteComparisons.verified = (verified === "true");
    }



    // Filter by activated (based on lastLogin)
    if (req.query.activated != null) {
        const activated = req.query.activated === "true";
        attibuteComparisons.lastLogin = activated ? { not: null } : { equals: null };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // Validate page and limit
    if (page <= 0) return res.status(400).json({ message: "Invalid page number" });
    if (limit <= 0) return res.status(400).json({ message: "Invalid limit value" });

    const skip = (page - 1) * limit;
    const take = limit;

    try {
        // Prisma transaction to get count and paginated results
        const [count, users] = await prisma.$transaction([
            prisma.user.count({ where: attibuteComparisons }),
            prisma.user.findMany({
                where: attibuteComparisons,
                skip,
                take,
            }),
        ]);

        const results = users.map(user => ({
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            birthday: user.birthday ? user.birthday.toISOString().split('T')[0] : null,
            role: user.role,
            points: user.points,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            verified: user.verified,
            avatarUrl: user.avatarUrl,
        }));

        // Respond with count and results
        res.json({ count, results });

    } catch (err) {
        console.error('Error fetching user', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Get the current logged in user info
router.get("/me", authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch user + promotions used
        const userMe = await prisma.user.findFirst({
            where: { id: userId },
            include: { promotionsUsed: true },
        });

        if (!userMe) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Extract used promotion IDs
        const usedPromotionIds = userMe.promotionsUsed.map(p => p.id);

        // 3. Fetch available promotions (not used)
        const availablePromotions = await prisma.promotion.findMany({
            where: {
                id: { notIn: usedPromotionIds.length ? usedPromotionIds : [0] },
                startTime: { lte: new Date() },
                endTime: { gte: new Date() },
            },
            orderBy: { createdAt: "desc" },
        });

        // 4. Respond with used + available separately
        return res.json({
            id: userMe.id,
            utorid: userMe.utorid,
            name: userMe.name,
            email: userMe.email,
            birthday: userMe.birthday,
            role: userMe.role,
            points: userMe.points,
            createdAt: userMe.createdAt,
            lastLogin: userMe.lastLogin,
            verified: userMe.verified,
            avatarUrl: userMe.avatarUrl,
            promotions: {
                used: userMe.promotionsUsed,
                available: availablePromotions
            }
        });

    } catch (error) {
        console.error("GET /me error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


// Patch the current logged in user info
router.patch('/me', authenticate, checkClearance('regular'), async (req, res) => {
    try {
        // Check if request contains a file
        if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
            await new Promise((resolve, reject) => {
                uploadAvatar.single("avatar")(req, res, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }

        const userId = parseInt(req.user.id);
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const { name, email, birthday } = req.body;
        
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        
        if (!user) return res.status(404).json({ message: "User not found" });

        // Attributes to update
        const updatedAttributes = {};
        
        // Input checks
        if (name !== undefined) {
            if (typeof name !== 'string' || name.length < 1 || name.length > 50) {
                return res.status(400).json({ message: "Name can only be 1-50 characters" });
            }
            updatedAttributes.name = name;
        }
        
        if (email !== undefined) {
            if (typeof email !== 'string' || !email.endsWith("@mail.utoronto.ca")) {
                return res.status(400).json({ message: "Email must be valid UofT address" });
            }
            updatedAttributes.email = email;
        }
        
        if (birthday !== undefined) {
            // Validate birthday format
            if (typeof birthday !== 'string') {
                return res.status(400).json({ message: "Birthday must be a string" });
            }
            
            const birthdayDate = new Date(birthday);
            if (isNaN(birthdayDate.getTime())) {
                return res.status(400).json({ message: "Invalid birthday format" });
            }
            
            // Check if birthday is in the future
            const today = new Date();
            if (birthdayDate > today) {
                return res.status(400).json({ message: "Birthday cannot be in the future" });
            }
            
            updatedAttributes.birthday = birthdayDate;
        }

        if (req.file) {
            updatedAttributes.avatarUrl = `/uploads/avatars/${req.file.filename}`;
        }

        // Check if any field is updated
        if (Object.keys(updatedAttributes).length === 0) {
            return res.status(400).json({ message: 'No fields to update.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updatedAttributes,
        });

        const result = {
            id: updatedUser.id,
            utorid: updatedUser.utorid,
            name: updatedUser.name,
            email: updatedUser.email,
            birthday: updatedUser.birthday.toISOString().split('T')[0],
            role: updatedUser.role,
            points: updatedUser.points,
            createdAt: updatedUser.createdAt,
            lastLogin: updatedUser.lastLogin,
            verified: updatedUser.verified,
            avatarUrl: updatedUser.avatarUrl,
        };

        return res.json(result);

    } catch (err) {
        console.error('Error updating user info', err);
        
        // Handle Prisma errors specifically
        if (err.code === 'P2002') { // Unique constraint violation
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Update current user logged in password
router.patch('/me/password', authenticate, checkClearance('regular'), async (req, res) => {
    const userId = parseInt(req.user.id);
    const oldPassword = req.body.old;
    const newPassword = req.body.new;

    // Validate required fields
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Requires old and new password' });
    }

    // Validate new password requirements: 8-20 characters with complexity
    if (typeof newPassword !== 'string') {
        return res.status(400).json({ message: 'New password must be a string' });
    }

    if (newPassword.length < 8 || newPassword.length > 20) {
        return res.status(400).json({ message: 'New password must be 8-20 characters long' });
    }

    // Password complexity validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
            message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
        });
    }

    // Prevent using same password
    if (oldPassword === newPassword) {
        return res.status(400).json({ message: 'New password must be different from old password' });
    }

    try {
        const userMe = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userMe) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Check if user current password exists
        if (!userMe.password) {
            return res.status(400)
            .json({ message: "Cannot reset password because no existing password is set. Use password setup instead." });
        }

        // Verify old password
        const match = await bcrypt.compare(oldPassword, userMe.password);
        if (!match) {
            return res.status(403).json({ message: 'Current password is incorrect' });
        }

        // Hash and update new password
        const newPasswordHashed = await bcrypt.hash(newPassword, 10);
        
        await prisma.user.update({
            where: { id: userId },
            data: { password: newPasswordHashed }
        });

        return res.status(200).json({ message: "Password changed" });

    } catch (err) {
        console.error('Error updating password', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new redemption transaction
router.post('/me/transactions', authenticate, checkClearance('regular'), async (req, res) => {
    const currentUser = req.user;
    const { type, amount, remark = "" } = req.body;

    // User must be verified
    if (!currentUser.verified) {
        return res.status(403).json({ message: "Only verified users can redeem points" });
    }

    // Validate type: must be "redemption"
    if (type === undefined) {
        return res.status(400).json({ message: "type is required" });
    }
    if (type !== "redemption") {
        return res.status(400).json({ message: "type must be redemption" });
    }

    // Validate amount (positive integer)
    const amountNum = Number(amount);
    if (amount === undefined) {
        return res.status(400).json({ message: "Points to redeem is required" });
    }
    if (isNaN(amountNum) || !Number.isInteger(amountNum) || amountNum <= 0) {
        return res.status(400).json({ message: "Points to redeem must be a positive integer" });
    }

    // User must have enough points
    if (currentUser.points < amountNum) {
        return res.status(400).json({ message: "Insufficient points" });
    }

    try {
        const newTransaction = await prisma.transaction.create({
            data: {
                type: "redemption",
                amount: -amountNum,
                remark,
                user: {
                    connect: { id: currentUser.id }
                },
                createdBy: {
                    connect: { id: currentUser.id }
                }
            },
            include: {
                user: true,
                createdBy: true
            }
        });

        const result = {
            id: newTransaction.id,
            utorid: newTransaction.user.utorid,
            type: newTransaction.type,
            amount: Math.abs(newTransaction.amount),
            remark: newTransaction.remark,
            createdBy: newTransaction.createdBy.utorid,
            createdAt: newTransaction.createdAt
        };

        return res.status(201).json(result);

    } catch (err) {
        console.error("Error creating redemption transaction", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Retrieve a list of transactions owned by the currently logged in user
router.get("/me/transactions", authenticate, checkClearance('regular'), async (req, res) => {
    const type = req.query.type;
    const relatedId = req.query.relatedId;
    const promotionId = req.query.promotionId;
    const amount = req.query.amount;
    const operator = req.query.operator;
    const page = req.query.page;
    const limit = req.query.limit;

    const filterBy = {
        userId: req.user.id  // Only get transactions for the current user
    };  

    // Validate type - must be a valid transaction type if provided
    if (type !== undefined) {
        const validTypes = ['adjustment', 'transfer', 'redemption', 'event', 'purchase'];
        if (!validTypes.includes(type.toLowerCase())) {
            return res.status(400).json({ error: "type must be one of: adjustment, transfer, redemption, event, purchase" });
        }
        filterBy.type = type;
    }

    // Validate relatedId - must be used with type
    if (relatedId !== undefined && !type) {
        return res.status(400).json({ error: "relatedId must be used with type" });
    }

    // Validate relatedId - must be a valid number if provided
    if (relatedId !== undefined) {
        const relatedIdNum = Number(relatedId);
        if (isNaN(relatedIdNum) || !Number.isInteger(relatedIdNum) || relatedIdNum < 0) {
            return res.status(400).json({ error: "relatedId must be a valid positive integer" });
        }
        filterBy.relatedId = relatedIdNum;
    }

    // For promotionId filter - check if promotion is in array
    if (promotionId !== undefined) {
        const promotionIdNum = Number(promotionId);
        if (isNaN(promotionIdNum) || !Number.isInteger(promotionIdNum) || promotionIdNum < 0) {
            return res.status(400).json({ error: "promotionId must be a valid positive integer" });
        }
        filterBy.promotionIds = { has: promotionIdNum };
    }

    // Validate amount - must be used with operator
    if (amount !== undefined && !operator) {
        return res.status(400).json({ error: "amount must be used with operator" });
    }

    // Validate operator - must be used with amount
    if (operator !== undefined && amount === undefined) {
        return res.status(400).json({ error: "operator must be used with amount" });
    }

    // Validate operator - must be 'gte' or 'lte' if provided
    if (operator !== undefined && operator !== 'gte' && operator !== 'lte') {
        return res.status(400).json({ error: "operator must be either 'gte' or 'lte'" });
    }

    // Handle amount with operator (validate and set together)
    if (amount !== undefined) {
        const amountNum = Number(amount);
        if (isNaN(amountNum)) {
            return res.status(400).json({ error: "amount must be a valid number" });
        }
        
        if (operator === 'gte') {
            filterBy.amount = { gte: amountNum };
        } else if (operator === 'lte') {
            filterBy.amount = { lte: amountNum };
        }
    }

    // Validate page - must be a valid positive integer if provided
    let pageNum = 1; // default
    if (page !== undefined) {
        pageNum = Number(page);
        if (isNaN(pageNum) || !Number.isInteger(pageNum) || pageNum < 1) {
            return res.status(400).json({ error: "page must be a positive integer (minimum 1)" });
        }
    }

    // Validate limit - must be a valid positive integer if provided
    let limitNum = 10; // default
    if (limit !== undefined) {
        limitNum = Number(limit);
        if (isNaN(limitNum) || !Number.isInteger(limitNum) || limitNum < 1) {
            return res.status(400).json({ error: "limit must be a positive integer (minimum 1)" });
        }
    }

    // Pagination
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    try {
        // Prisma transaction to get count and paginated results
        const [count, transactions] = await prisma.$transaction([
            prisma.transaction.count({ where: filterBy }),
            prisma.transaction.findMany({
                where: filterBy,
                skip,
                take,
                include: {
                    user: true,        // Include user (current)
                    createdBy: true    // Include creator (cashier/manager)
                },
                orderBy: {
                    createdAt: "desc", // or "asc"
                },
            }),
        ]);

        // Build user map for transfer sender/recipient lookup
        const relatedIds = transactions
            .filter(t => t.relatedId !== null)
            .map(t => t.relatedId);

        const relatedUsers = await prisma.user.findMany({
            where: { id: { in: relatedIds } }
        });

        const relatedMap = {};
        relatedUsers.forEach(u => {
            relatedMap[u.id] = u.utorid;
        });

        // Map results
        const results = transactions.map(transaction => {
            let sender = null;
            let recipient = null;

            if (transaction.type === "transfer") {
                const otherUserUTORid = relatedMap[transaction.relatedId] || null;

                if (transaction.amount < 0) {
                    // Current user sent points
                    sender = transaction.user.utorid;
                    recipient = otherUserUTORid;
                } else {
                    // Current user received points
                    sender = otherUserUTORid;
                    recipient = transaction.user.utorid;
                }
            }

            return {
                id: transaction.id,
                type: transaction.type,
                spent: transaction.spent ?? undefined,
                amount: transaction.amount,
                relatedId: transaction.relatedId ?? undefined,
                promotionIds: transaction.promotionIds,
                remark: transaction.remark,
                createdBy: transaction.createdBy.utorid,
                createdAt: transaction.createdAt,
                sender,
                recipient
            };
        });

        return res.json({ count, results });

    } catch (err) {
        console.error('Error fetching transactions', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new transfer transaction
router.post('/:userId/transactions', authenticate, checkClearance('regular'), async (req, res) => {
    const recipientId = parseInt(req.params.userId);
    const senderId = req.user.id;
    const type = req.body.type;
    const amount = req.body.amount;
    const remark = req.body.remark || "";

    // 403 Forbidden if the sender is not verified
    if (!req.user.verified) {
        return res.status(403).json({ message: "Only verified accounts can transfer points" });
    }

    // Validate type: must be transfer
    if (type !== undefined) {
        if (type !== 'transfer') {
            return res.status(400).json({ message: "type must be transfer" });
        }
    } else {
        return res.status(400).json({ message: "type is required" });
    }

    // Validate amount
    const amountNum = Number(amount);
    if (amount !== undefined) {
        if (isNaN(amountNum) || !Number.isInteger(amountNum) || amountNum <= 0) {
            return res.status(400).json({ message: "amount must be a positive integer" });
        }
    } else {
        return res.status(400).json({ message: "amount is required" });
    }

    // Check if sender and recipient are the same
    if (senderId === recipientId) {
        return res.status(400).json({ message: "Cannot transfer to yourself" });
    }

    try {
        // Check if recipient exists
        const recipient = await prisma.user.findUnique({
            where: { id: recipientId }
        });

        if (!recipient) {
            return res.status(404).json({ message: "Recipient user not found" });
        }

        // Check if sender has enough points
        if (req.user.points < amountNum) {
            return res.status(400).json({ message: "Insufficient points" });
        }

        // Deduct points from sender first
        const senderUpdated = await prisma.user.update({
        where: { id: senderId },
        data: { points: { decrement: amountNum } },
        });

        // Add points to recipient
        const recipientUpdated = await prisma.user.update({
        where: { id: recipientId },
        data: { points: { increment: amountNum } },
        });

        // Create transactions AFTER updating points
        const senderTransaction = await prisma.transaction.create({
        data: {
            type: 'transfer',
            amount: -amountNum,
            remark,
            user: { connect: { id: senderId } },
            createdBy: { connect: { id: senderId } },
            relatedId: recipientId
        },
        include: { user: true }
        });

        const recipientTransaction = await prisma.transaction.create({
        data: {
            type: 'transfer',
            amount: amountNum,
            remark,
            user: { connect: { id: recipientId } },
            createdBy: { connect: { id: senderId } },
            relatedId: senderId
        },
        include: { user: true }
        });

        // Save points snapshots using the updated points
        await savePointsSnapshot(senderUpdated.id, senderUpdated.points);
        await savePointsSnapshot(recipientUpdated.id, recipientUpdated.points);


        const result = {
            id: senderTransaction.id,
            sender: senderTransaction.user.utorid,
            recipient: recipientTransaction.user.utorid,
            type: senderTransaction.type,
            sent: Math.abs(senderTransaction.amount),
            remark: senderTransaction.remark,
            createdAt: senderTransaction.createdAt,
        };


        return res.status(201).json(result);

    } catch (err) {
        console.error('Error creating transfer transaction', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Get user by utorid
router.get('/utorid/:utorid', authenticate, checkClearance('regular'), async (req, res) => {
    const { utorid } = req.params;

    if (!utorid || typeof utorid !== 'string' || utorid.trim() === '') {
        return res.status(400).json({ message: 'Missing or invalid utorid parameter' });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { utorid: utorid.trim() },
            select: {
                id: true,
                utorid: true,
                name: true,
                points: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(user);
    } catch (err) {
        console.error('Error looking up user by UTORID:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Lookup customer promotions by utorid (for cashiers)
router.get("/promotions-lookup", authenticate, checkClearance('cashier'), async (req, res) => {
    const utorid = req.query.utorid;
    const now = new Date();

    // Validate utorid query parameter
    if (!utorid) {
        return res.status(400).json({ message: 'Missing required query parameter: utorid' });
    }

    if (typeof utorid !== 'string' || utorid.trim() === '') {
        return res.status(400).json({ message: 'Invalid utorid parameter. Must be a non-empty string.' });
    }

    try {
        // Look up user by utorid including used promotions
        const user = await prisma.user.findFirst({
            where: { utorid: utorid.trim() },
            include: {
                promotionsUsed: {
                    select: {
                        id: true,
                        name: true,
                        minSpending: true,
                        rate: true,
                        points: true,
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'Customer not found with the provided utorid' });
        }

        // Extract used promotion IDs
        const usedPromotionIds = user.promotionsUsed.map(p => p.id);

        // Fetch available promotions (onetime, active, not used)
        const availablePromotions = await prisma.promotion.findMany({
            where: {
                type: 'onetime',
                startTime: { lte: now },
                endTime: { gte: now },
                id: { notIn: usedPromotionIds.length ? usedPromotionIds : [0] }
            },
            select: {
                id: true,
                name: true,
                minSpending: true,
                rate: true,
                points: true,
            },
        });

        // Return minimal information needed for cashier workflow
        const result = {
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            points: user.points,
            verified: user.verified,
            promotions: {
                used: user.promotionsUsed,
                available: availablePromotions
            }
        };

        return res.json(result);

    } catch (err) {
        console.error('Error in promotions lookup:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// Retrieve a specific user
router.get('/:userId', authenticate, checkClearance('cashier'), async (req, res) => {
    const userId = parseInt(req.params.userId);
    const now = new Date();
    try {
        // Fetch user including used promotions
        const user = await prisma.user.findFirst({
            where: { id: userId },
            include: {
                promotionsUsed: {
                    select: {
                        id: true,
                        name: true,
                        minSpending: true,
                        rate: true,
                        points: true,
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract used promotion IDs
        const usedPromotionIds = user.promotionsUsed.map(p => p.id);

        // Fetch available promotions (onetime, active, not used)
        const availablePromotions = await prisma.promotion.findMany({
            where: {
                type: 'onetime',
                startTime: { lte: now },
                endTime: { gte: now },
                id: { notIn: usedPromotionIds }
            },
            select: {
                id: true,
                name: true,
                minSpending: true,
                rate: true,
                points: true,
            },
        });

        const result = {
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            points: user.points,
            verified: user.verified,
            promotions: {
                used: user.promotionsUsed,
                available: availablePromotions
            }
        };

        const isManagerOrHigher = ['manager', 'superuser'].includes(req.user.role);
        if (isManagerOrHigher) {
            result.email = user.email;
            result.birthday = user.birthday;
            result.role = user.role;
            result.createdAt = user.createdAt;
            result.lastLogin = user.lastLogin;
            result.avatarUrl = user.avatarUrl;
            result.suspicious = user.suspicious;
        }

        return res.json(result);

    } catch (err) {
        console.error('Error fetching user', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a specific user's various statuses and some information
router.patch('/:userId', authenticate, checkClearance('manager'), async (req, res) => {
    const userId = parseInt(req.params.userId);
    const {email, verified, suspicious, role} = req.body;
    const currentClearance = req.user.role;
    
    // Check if the current clearance can update the role
    if (role) {
        if (currentClearance === 'manager' && !['regular', 'cashier'].includes(role)) {
            return res.status(403).json({ message: 'Managers can only assign regular and cashier roles' });
        }
    }

    // Prisma update the user
    try {
        // Find user to update
        const user = await prisma.user.findUnique({
            where: {id: userId}
        });
        
        // User is not found
        if (!user) {
            return res.status(404).json({message: "User is not found"});
        }

        // Suspicious user cannot be promoted to cashier
        if ((user.suspicious || suspicious === "true") && (role == 'cashier')) {
            return res.status(400).json({message: "Suspicious user cannot be promoted to cashier"})
        } 

        // Find the attributes to update
        const updatedAttribute = {};
        if (email) updatedAttribute.email = email;
        if (verified !== undefined) updatedAttribute.verified = verified;
        if (suspicious !== undefined) {
            if (suspicious === "true" || suspicious === true) updatedAttribute.suspicious = true;
            else if (suspicious === "false" || suspicious === false) updatedAttribute.suspicious = false;
        }
        if (role) updatedAttribute.role = role;

        // If nothing to update, just return current user
        if (Object.keys(updatedAttribute).length === 0) {
            return res.status(200).json({
                id: user.id,
                utorid: user.utorid,
                name: user.name
            });
        }

        // Update the user
        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: updatedAttribute,
        });

        // The updated fields
        const result = {
            id: updatedUser.id,
            utorid: updatedUser.utorid,
            name: updatedUser.name
        }
        
        for (let key of Object.keys(updatedAttribute)) {
            result[key] = updatedAttribute[key];
        }

        return res.json(result);

    } catch (err) {
        console.error('Error fetching user', err);
        return res.status(500).json({message:'Internal server error'})
    }
});

// Delete a specific user
router.delete('/:userId', authenticate, checkClearance('manager'), async (req, res) => {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Optional: prevent deletion of higher clearance users
        if (['manager', 'superuser'].includes(user.role)) {
            return res.status(403).json({ message: "Cannot delete users with manager or superuser role" });
        }

        // Delete the user
        await prisma.user.delete({
            where: { id: userId }
        });

        return res.status(200).json({ message: "User deleted successfully" });

    } catch (err) {
        console.error("Error deleting user", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;