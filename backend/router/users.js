// Express router
const express = require('express');
const router = express.Router();

// PrismaClient
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Brcypt
const bcrypt = require('bcrypt');
// JWT
const jwt = require('jsonwebtoken');

// Middleware: Authenticate
const authenticate = require('../middleware/authenticate');
// Middleware: Clearance Check
const clearanceCheck = require('../middleware/checkClearance');
// Middleware: Upload Avatar
// const uploadAvatar = require('../middleware/uploadAvatar');

// Register user
router.post("/", authenticate, clearanceCheck('cashier'), async (req, res) => {
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
router.get("/", authenticate, clearanceCheck('manager'), async (req, res) => {    
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
        attibuteComparisons.verified = req.query.verified === "true";
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

router.get('/me', authenticate, clearanceCheck('regular'), async (req, res) => {
    const userMeId = parseInt(req.user.id);
    if (!userMeId || isNaN(userMeId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    try {
        const userMe = await prisma.user.findFirst({
            where: {id: userMeId},
            // include: {
            //     promotions: { 
            //         where: {
            //             userId: userMeId
            //         }
            //     }
            // }
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


module.exports = router;