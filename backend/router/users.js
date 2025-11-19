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
    if (req.query.verified !== undefined) {
        if (verified !== 'true' 
        && verified !== true
        && verified !== 'false'
        && verified !== false) {
            return res.status(400).json({ error: "verified must be a boolean value" });
        }

        if (verified !== 'true' || verified !== true) {
            attibuteComparisons.verified = true;
        } else {
            attibuteComparisons.verified = false;
        }
    }

    // Filter by activated (based on lastLogin)
    if (req.query.activated !== undefined) {
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
router.get('/me', authenticate, checkClearance('regular'), async (req, res) => {
    const userMeId = parseInt(req.user.id);
    if (!userMeId || isNaN(userMeId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    try {
        const userMe = await prisma.user.findFirst({
            where: {id: userMeId},
            include: {
                promotions: true,
            }
        });

        if (!userMe) return res.status(404).json({message: "User not found"});
        
        const result = {
            id: userMe.id,
            utorid: userMe.utorid,
            name: userMe.name,
            email: userMe.email,
            birthday: userMe.birthday ? userMe.birthday.toISOString().split('T')[0] : null,
            role: userMe.role,
            points: userMe.points,
            createdAt: userMe.createdAt,
            lastLogin: userMe.lastLogin,
            verified: userMe.verified,
            avatarUrl: userMe.avatarUrl,
            promotions: userMe.promotions ? userMe.promotions : [],
        };

        return res.json(result);

    } catch (err) {
        console.error('Error fetching user', err);
        return res.status(500).json({message:'Internal server error'})
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
    const type = req.body.type;
    const amount = req.body.amount;
    const remark = req.body.remark || "";
    
    // 403 Forbidden if the logged-in user is not verified
    if (!currentUser.verified) {
        return res.status(403).json({ message: "Forbidden" });
    }

    // Validate type: must be redemption
    if (type !== undefined) {
        if (type !== 'redemption') {
            return res.status(400).json({message: "type must be redemption"})
        }
    } else {
        return res.status(400).json({message: "type is required"})
    }

    // Validate amount
    const amountNum = Number(amount);
    if (amount !== undefined) {
        if (isNaN(amountNum) || !Number.isInteger(amountNum) || amountNum < 0) {
            return res.status(400).json({message: "amount must be a positive integer number"})
        }
    } else {
        return res.status(400).json({message: "amount is required"})
    }

    // Create redemption transaction in prisma
    try {
        // 400 Bad Request if the requested amount exceeds user's point balance
        if (currentUser.points < amount) {
            return res.status(400).json({ message: "Insufficient points" });
        }
        const newTransaction = await prisma.transaction.create({
            data: {
                type: type,
                amount: amount,
                remark: remark,
                user: { 
                    connect: { id: currentUser.id }
                },
                createdBy: { 
                    connect: { id: currentUser.id }
                },
            },
            include: {
            user: true,
            createdBy: true
        }
        })
        const result = {
            id: newTransaction.id,
            utorid: newTransaction.user.utorid,
            type: newTransaction.type,
            processedBy: newTransaction.processedBy,
            amount: newTransaction.amount,
            remark: newTransaction.remark,
            createdBy: newTransaction.createdBy.utorid
        }
        return res.status(201).json(result);
    } catch (err) {
        console.error('Error creating redemption transaction', err);
        return res.status(500).json({ message: 'Internal server error' });
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

    // Fetch transactions
    try {
        // Prisma transaction to get count and paginated results
        const [count, transactions] = await prisma.$transaction([
            prisma.transaction.count({ where: filterBy }),
            prisma.transaction.findMany({
                where: filterBy,
                skip,
                take,
                include: {
                    user: true,           // Include user (customer)
                    createdBy: true       // Include creator (cashier/manager)
                }
            }),
        ]);

        const results = transactions.map(transaction => ({
            id: transaction.id,
            type: transaction.type,
            ...(transaction.spent && { spent: transaction.spent }),
            amount: transaction.amount,
            ...(transaction.relatedId && { relatedId: transaction.relatedId }),
            promotionIds: transaction.promotionIds,
            remark: transaction.remark,
            createdBy: transaction.createdBy.utorid
        }));

        // Respond with count and results
        return res.json({ count, results });

    } catch (err) {
        console.error('Error fetching transactions', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Retrieve a specific user
router.get('/:userId', authenticate, checkClearance('cashier'), async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const user = await prisma.user.findFirst({
            where: {id: userId},
            include: {
                promotions: true,
            }
        });
        if (!user) {
            return res.status(404).json({message:'User is not found'})
        }
        
        const result = {
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            points: user.points,
            verified: user.verified,
            promotions: user.promotions ? user.promotions : [],
        };

        // Check clearance manager or higher 
        const isManagerOrHigher = ['manager', 'superuser'].includes(req.user.role);
        if (isManagerOrHigher) {
            result.email = user.email;
            result.birthday = user.birthday;
            result.role = user.role;
            result.createdAt = user.createdAt;
            result.lastLogin = user.lastLogin;
            result.avatarUrl = user.avatarUrl;
        }

        return res.json(result);

    } catch (err) {
        console.error('Error fetching user', err);
        return res.status(500).json({message:'Internal server error'})
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

module.exports = router;