const jwt = require("jsonwebtoken");

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createResetToken(user) {
    // Create JWT
    const payload = { userId: user.id };
    const resetToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    // Expiry time
    const resetTokenExpiresAt = new Date(
        Date.now() + 1000 * 60 * process.env.JWT_RESET_EXPIRES_IN
    );

    // Save update in DB
    await prisma.resetToken.upsert({
        where: { userId: user.id },
        update: {
            token: resetToken,
            expiresAt: resetTokenExpiresAt,
            used: false,
        },
        create: {
            userId: user.id,
            token: resetToken,
            expiresAt: resetTokenExpiresAt,
            used: false,
        }
    });

    return { resetToken, resetTokenExpiresAt }
}

module.exports = { createResetToken };