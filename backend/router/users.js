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
                username: name,
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

module.exports = router;