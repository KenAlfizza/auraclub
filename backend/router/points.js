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




module.exports = router;