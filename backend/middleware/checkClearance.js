const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function clearanceCheck(minRole) { 
    const roles = {'regular': 0, 'cashier': 1, 'manager': 2, 'superuser':3};
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            return res.status(401).json({'message': 'Unauthorized'});
        }

        if (roles[userRole] < roles[minRole]) {
            return res.status(403).json({'message': 'Forbidden'});
        }
        next();
    }

}
module.exports = clearanceCheck;