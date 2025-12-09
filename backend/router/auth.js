require('dotenv').config();
const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const authenticate = require('../middleware/authenticate');

// Login token function
router.post('/tokens', async (req, res) => {
    // Get the utorid and password from the payload
    const utorid = req.body.utorid;
    const password = req.body.password;
    if (!utorid || !password) {
        return res.status(400).json({ error: "Missing Credentials" });
    }

    // Retrieve user from utorid
    try {
        const user = await prisma.user.findFirst({
            where: {utorid: utorid},
        });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // No password
        if (!user.password) {
            return res.status(401).json({message:"No password set"})
        }
        
        const match = await bcrypt.compare(password, user.password);
        const currentDate = Date.now();
        if (match) {
            const payload = {userId: user.id, userRole: user.role};
            const token = jwt.sign(payload, 
                process.env.JWT_SECRET, 
                {expiresIn: `${process.env.JWT_EXPIRES_IN}h`});
            const expiresAt = new Date(currentDate + 1000 * 60 * 60 * process.env.JWT_EXPIRES_IN).toISOString();

            // Save token to prisma
            await prisma.loginToken.upsert({ 
                where : {
                    userId: user.id,
                },
                update: {
                    token: token,
                    expiresAt: expiresAt, 
                },
                create: {  
                    userId: user.id, 
                    token: token,
                    expiresAt: expiresAt, 
                }
            });
            // DEBUGGING
            console.log("LoginToken Decrypted:");
            console.log(jwt.verify(token, process.env.JWT_SECRET));

            // Update user lastLogin status
            await prisma.user.update({
                where: {id: user.id},
                data: {lastLogin: new Date(currentDate)}
            })

            return res.status(200).json({"token": token, "expiresAt": expiresAt});

        } else {
            return res.status(401).json({ message: "Unautorized" })
        }

    } catch (err) {
        console.error("Error fetching user", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Reset password token function
router.post('/resets', authenticate, async (req, res) => {
    const utorid = req.body.utorid;
    if (!utorid) return res.status(400).json({ message: "utorid required" });

    try {
        // Find user
        const user = await prisma.user.findFirst({ where: { utorid } });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Call reset token service
        const { createResetToken } = require("../services/resetTokenService");
        const { token, expiresAt } = await createResetToken(user);

        // DEBUGGING
        console.log("ResetToken Decrypted:");
        console.log(jwt.verify(token, process.env.JWT_SECRET));

        return res.status(202).json({
            resetToken: token,
            expiresAt: expiresAt.toISOString(),
        });

    } catch (err) {
        console.error("Error fetching user", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/resets/:resetToken', async (req, res) => {
    const resetToken = req.params.resetToken;
    const utorid = req.body.utorid;
    const password = req.body.password;

    // Check the payload
    if (!utorid || !password) return res.status(400).json({ message: 'utorid or password missing' });

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: "Password must be 8-20 characters with uppercase, lowercase, number, and special character." });
    }

    // Prisma
    try {
        // Find reset token
        const resetTokenRecord = await prisma.resetToken.findFirst({
            where: { token: resetToken},
            include: {user: true}
        });
        
        // Check if token is not found
        if (!resetTokenRecord) {
            return res.status(404).json({ message: 'Reset token not found' });
        }

        // Check if token expired 
        if (resetTokenRecord.expiresAt < new Date(Date.now())) { 
            return res.status(410).json({ message: 'Reset token expired'}); 
        }

        // Check if token is used
        if (resetTokenRecord.used) {
            return res.status(410).json({ message: 'Reset token already used'}); 
        }

        // Check if utorid mismatch
        if (resetTokenRecord.user.utorid !== utorid) {
            return res.status(401).json({ message: "Reset token does not match user." });
        }

        // Hash new password
        const passwordHashed = await bcrypt.hash(password, 10);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetTokenRecord.userId },
                data: { password: passwordHashed },
            }),
            prisma.resetToken.update({
                where: { id: resetTokenRecord.id },
                data: { used: true },
            }),
        ]);
        return res.status(200).json({message: "Password reset successfully"});

    } catch (err) {
        console.error('Error resetting password', err);
        return res.status(500).json({ message: 'Internal server error' });
   }
});

// POST /api/auth/forgot-password
router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour expiry

    // Save token & expiry in DB (you need to add these fields in your User model or a separate table)
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expires,
      },
    });

    // Send reset email (using Nodemailer)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;

    await transporter.sendMail({
      from: `"AuraClub" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>This link will expire in 1 hour.</p>`,
    });

    return res.json({ message: "Password reset link sent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;




