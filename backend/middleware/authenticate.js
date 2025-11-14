require('dotenv').config();
const jwt = require('jsonwebtoken');

// PrismaClient
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Authenticate Function
async function authenticate(req, res, next) {
    // Get the jwt token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({'message': 'Unauthorized'});
    }
    // Remove bearer from the string and get only the token
    const token = authHeader.split(' ')[1];
    try {       
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);

        // DEBUGGING
        console.log("Authenticate Decrypted:");
        console.log(jwt.verify(token, process.env.JWT_SECRET));
        
        // Fetch user by id
        const user = await prisma.user.findUnique({ 
            where: { id: decoded.userId } 
        });
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        req.user = { id: user.id, role: user.role };
        // Go to next function
        next();
    } catch (err) {
        console.error("JWT verification failed", err.message);
        return res.status(401).json({'message': 'Unauthorized'});
    }
}

module.exports = authenticate;