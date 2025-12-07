#!/usr/bin/env node
'use strict';

const port = (() => {
    const args = process.argv;

    if (args.length !== 3) {
        console.error("usage: node index.js port");
        process.exit(1);
    }

    const num = parseInt(args[2], 10);
    if (isNaN(num)) {
        console.error("error: argument must be an integer.");
        process.exit(1);
    }

    return num;
})();

const express = require("express");
const app = express();
const cors = require('cors')

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.use(express.json());

// In your backend
app.use(cors({
  origin: 'http://localhost:5173' // Your Vite dev server
}))

app.use('/uploads', express.static('uploads'));

// Router: Auth
const authRouter = require('./router/auth');
app.use('/auth', authRouter);

// Router: Users
const usersRouter = require('./router/users');
app.use('/users', usersRouter);

// Routes: Promotions
const promotionsRouter = require('./router/promotions');
app.use('/promotions', promotionsRouter);

// Routes: Transactions
const transactionsRouter = require('./router/transactions');
app.use('/transactions', transactionsRouter);

// Routes: Events
const eventsRouter = require('./router/events');
app.use('/events', eventsRouter);


const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});