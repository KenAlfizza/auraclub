// Express router
const express = require('express');
const router = express.Router();

// PrismaClient
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware: Authenticate
const authenticate = require('../middleware/authenticate');
// Middleware: Clearance Check
const checkClearance = require('../middleware/checkClearance');

// Create a new transfer transaction between the current logged-in user 
router.post("/", authenticate, checkClearance('cashier'), async (req, res) => {
  const currentUser = req.user;
  const customerUtorid = req.body.utorid;
  const transactionType = req.body.type;
  const transactionSpent = parseFloat(req.body.spent);
  const transactionPromotionIds = req.body.promotionIds;
  const transactionRemark = req.body.remark ? req.body.remark : '';

  // Validate utorid and type
  if (!customerUtorid || !transactionType || !transactionSpent) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Find the current user creating the transaction
    const user = await prisma.user.findFirst({where : {id: currentUser.id}});
    if (!user) return res.status(404).json({message: "User creating a purchase is not found"});
    
    // Find the customer making transaction
    const customer = await prisma.user.findFirst({where : {utorid: customerUtorid}});
    if (!customer) return res.status(404).json({message: "Customer making a purchase is not found"});

    // Purchase transaction
    if (transactionType === "purchase") {
      // Cashier or higher can create purchase
      if (!["cashier", "manager", "superuser"].includes(currentUser.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Calculate earned points 
      const baseEarned = Math.round(transactionSpent * 100 / 25);
      const totalEarned = baseEarned;

      // Create new transaction
      const transaction = await prisma.transaction.create({
        data: {
            type: "purchase",
            spent: transactionSpent,
            remark: transactionRemark,
            //promotionIds: transactionPromotionIds ? transactionPromotionIds : [],
            createdBy: { 
              connect: {id: currentUser.id}
            },
            user: { 
              connect: {id: customer.id}
            },
        }
      });
      // NOTE:
      /*  the transcation is created by a user which is a cashier 
          which involves another user as a customer. 
          if the cashier is suspicious then the customer will not be awarded any points
      */
      // Update the customer's points. UNLESS current user as a cashier is suspicious
      if (!user.suspicious) {
        // Update the customer points
        const newpoints = customer.points + totalEarned;
        await prisma.user.update({
          where: {id: customer.id},
          data: {points: newpoints}
        })
      }

      const result = {
        id: transaction.id,
        utorid: customer.utorid,
        type: transaction.type,
        spent: transaction.spent,
        earned: totalEarned,
        remark: transaction.remark,
        promotionIds: transactionPromotionIds ? transactionPromotionIds : [],
        createdBy: user.utorid
      }
      return res.status(201).json(result);
    }
  } catch (err) {
    console.error("Error creating transaction:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});



// TODO: Implement the rest of transaction later after you haave implemented the promotions
module.exports = router;