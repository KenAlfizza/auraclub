/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
'use strict';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bcrypt = require('bcrypt');

async function main() {
    // Get CLI arguments
    const [utorid, email, password] = process.argv.slice(2);


    // Check all arguments are valid
    if (!utorid || !email || !password) {
        console.error("Usage: node prisma/createsu.js <utorid> <email> <password>");
        process.exit(1);
    }

    // Hash password
    const passwordHashed = await bcrypt.hash(password, 10);

    const superuser = {        
        utorid: utorid,    
        username: 'superuser',
        email: email,     
        password: passwordHashed,  
        birthday: new Date(1999,1,1),  
        role: 'superuser',      
        createdAt: new Date(),
    }

    await prisma.user.create({
        data: superuser,
    });
}

main().then(() => prisma.$disconnect);
