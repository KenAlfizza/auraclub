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

// Create a new purchase or adjustment transaction between the current logged-in user 
router.post("/", authenticate, checkClearance('cashier'), async (req, res) => {
  const currentUser = req.user;
  const customerUtorid = req.body.utorid;
  const transactionType = req.body.type;
  const transactionSpent = parseFloat(req.body.spent);
  const transactionPromotionIds = req.body.promotionIds;
  const transactionRemark = req.body.remark || '';

  // Validation
  if (!customerUtorid || !transactionType || transactionSpent === undefined)
    return res.status(400).json({ message: "Missing required fields" });
  if (typeof customerUtorid !== 'string' || customerUtorid.trim() === '')
    return res.status(400).json({ message: "UTORid must be a non-empty string" });
  if (!["purchase", "adjustment"].includes(transactionType))
    return res.status(400).json({ message: "Invalid transaction type" });
  if (isNaN(transactionSpent) || transactionSpent <= 0)
    return res.status(400).json({ message: "Spent must be a positive numeric value" });
  if (transactionPromotionIds && !Array.isArray(transactionPromotionIds))
    return res.status(400).json({ message: "promotionIds must be an array" });

  try {
    const user = await prisma.user.findFirst({ where: { id: currentUser.id } });
    if (!user) return res.status(404).json({ message: "User creating transaction not found" });

    const customer = await prisma.user.findFirst({ where: { utorid: customerUtorid } });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // Validate promotions
    let promotions = [];
    if (transactionPromotionIds?.length) {
      promotions = await prisma.promotion.findMany({ where: { id: { in: transactionPromotionIds } } });
      if (promotions.length !== transactionPromotionIds.length)
        return res.status(400).json({ message: "One or more promotion IDs are invalid" });

      const now = new Date();
      for (const promo of promotions) {
        if (promo.startTime && promo.startTime > now) 
          return res.status(400).json({ message: `Promotion "${promo.name}" has not started yet` });
        if (promo.endTime && promo.endTime < now) 
          return res.status(400).json({ message: `Promotion "${promo.name}" has expired` });
      }

      // Check one-time promotions already used
      const onetimeIds = promotions.filter(p => p.type === 'onetime').map(p => p.id);
      if (onetimeIds.length) {
        const alreadyUsed = await prisma.promotion.findFirst({
          where: {
            id: { in: onetimeIds },
            usedBy: { some: { id: customer.id } }
          }
        });

        if (alreadyUsed) {
          return res.status(400).json({ message: `One-time promotion "${alreadyUsed.name}" already used` });
        }
      }


      // Check min spending
      for (const promo of promotions) {
        if (promo.minSpending && transactionSpent < promo.minSpending)
          return res.status(400).json({ message: `Promotion "${promo.name}" requires minimum spending of $${promo.minSpending}` });
      }
    }

    // Create transaction data
    let transactionData = {
      type: transactionType,
      spent: transactionSpent,
      remark: transactionRemark,
      promotions: { connect: transactionPromotionIds?.map(id => ({ id })) || [] },
      createdBy: { connect: { id: currentUser.id } },
      user: { connect: { id: customer.id } }
    };

    if (transactionType === "purchase") {
      if (!["cashier", "manager", "superuser"].includes(currentUser.role))
        return res.status(403).json({ message: "Forbidden" });

      const baseEarned = Math.round(transactionSpent * 100 / 25);
      let totalEarned = baseEarned;

      promotions.forEach(p => {
        if (p.rate) totalEarned += Math.round(baseEarned * (p.rate - 1));
        else if (p.points) totalEarned += p.points;
      });

      transactionData.amount = totalEarned;

      const transaction = await prisma.transaction.create({ 
        data: transactionData, 
        include: { promotions: true } 
      });

      // Update customer points if cashier is not suspicious
      if (!user.suspicious) {
        await prisma.user.update({ 
          where: { id: customer.id }, 
          data: { points: customer.points + totalEarned } 
        });
      }

      // Mark promotions as used (loop)
      if (transactionPromotionIds?.length) {
        await prisma.$transaction(
          transactionPromotionIds.map(promoId =>
            prisma.promotion.update({
              where: { id: promoId },
              data: { usedBy: { connect: { id: customer.id } } }
            })
          )
        );
      }

      return res.status(201).json({
        id: transaction.id,
        utorid: customer.utorid,
        type: transaction.type,
        spent: transaction.spent,
        earned: totalEarned,
        remark: transaction.remark,
        promotionIds: transaction.promotions.map(p => p.id),
        promotions: transaction.promotions.map(p => ({ 
          id: p.id, 
          name: p.name, 
          description: p.description 
        })),
        createdBy: user.utorid,
        createdAt: transaction.createdAt
      });

    } else if (transactionType === "adjustment") {
      if (!["manager", "superuser"].includes(currentUser.role))
        return res.status(403).json({ message: "Forbidden" });

      const adjustmentAmount = req.body.amount;
      const adjustmentRelatedId = req.body.relatedId;

      if (adjustmentAmount === undefined || !adjustmentRelatedId)
        return res.status(400).json({ message: "Missing required fields for adjustment" });

      const relatedTransaction = await prisma.transaction.findUnique({ 
        where: { id: adjustmentRelatedId } 
      });
      if (!relatedTransaction) 
        return res.status(400).json({ message: "Related transaction not found" });

      transactionData.type = "adjustment";
      transactionData.amount = adjustmentAmount;
      transactionData.relatedId = adjustmentRelatedId;

      const transaction = await prisma.transaction.create({ 
        data: transactionData, 
        include: { promotions: true } 
      });

      await prisma.user.update({ 
        where: { id: customer.id }, 
        data: { points: customer.points + adjustmentAmount } 
      });

      // Mark promotions as used (loop)
      if (transactionPromotionIds?.length) {
        await prisma.$transaction(
          transactionPromotionIds.map(promoId =>
            prisma.promotion.update({
              where: { id: promoId },
              data: { usedBy: { connect: { id: customer.id } } }
            })
          )
        );
      }

      return res.status(201).json({
        id: transaction.id,
        utorid: customer.utorid,
        amount: transaction.amount,
        type: transaction.type,
        relatedId: transaction.relatedId,
        remark: transaction.remark,
        promotionIds: transaction.promotions.map(p => p.id),
        promotions: transaction.promotions.map(p => ({ 
          id: p.id, 
          name: p.name, 
          description: p.description 
        })),
        createdBy: user.utorid,
        createdAt: transaction.createdAt
      });

    } else {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

  } catch (err) {
    console.error("Error creating transaction:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//Get all transaction as a manager 
router.get("/", authenticate, checkClearance('manager'), async (req, res) => {
  const name = req.query.name;
  const createdBy = req.query.createdBy;
  const suspicious = req.query.suspicious;
  const promotionId = req.query.promotionId;
  const type = req.query.type;
  const relatedId = req.query.relatedId;
  const amount = req.query.amount;
  const operator = req.query.operator;
  const page = req.query.page;
  const limit = req.query.limit;

  const filterBy = {};

  // For name filter - search by utorid or name
  if (name !== undefined) {
    filterBy.OR = [
      { user: { utorid: { contains: name } } },
      { user: { name: { contains: name } } }
    ];
  }

  // For createdBy filter - search by utorid of creator
  if (createdBy !== undefined) {
    filterBy.createdBy = { utorid: createdBy };
  }

  // Validate suspicious - must be a boolean if provided
  if (suspicious !== undefined) {
    if (suspicious !== 'true' 
      && suspicious !== true
      && suspicious !== 'false'
      && suspicious !== false) {
      return res.status(400).json({ error: "suspicious must be a boolean value" });
    }
    filterBy.suspicious = suspicious === 'true';
  }

  // For promotionId filter - check if promotion is in array
  if (promotionId !== undefined) {
    const promotionIdNum = Number(promotionId);
    if (isNaN(promotionIdNum) || !Number.isInteger(promotionIdNum) || promotionIdNum < 0) {
      return res.status(400).json({ error: "promotionId must be a valid positive integer" });
    }
    filterBy.promotionIds = { has: promotionIdNum };
  }

  // Validate type - must be a valid transaction type if provided
  if (type !== undefined) {
    const validTypes = ['adjustment', 'transfer', 'redemption', 'event', 'purchase'];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({ error: "type must be one of: adjustment, transfer, redemption, event, purchase" });
    }
    filterBy.type = type;
  }

  // Validate relatedId - must be used with type
  if (relatedId !== undefined && !type) {
    return res.status(400).json({ error: "relatedId must be used with type" });
  }

  // Validate relatedId - must be a valid number if provided
  if (relatedId !== undefined) {
    const relatedIdNum = Number(relatedId);
    if (isNaN(relatedIdNum) || !Number.isInteger(relatedIdNum) || relatedIdNum < 0) {
      return res.status(400).json({ error: "relatedId must be a valid positive integer" });
    }
    filterBy.relatedId = relatedIdNum;
  }

  // Validate amount - must be used with operator
  if (amount !== undefined && !operator) {
    return res.status(400).json({ error: "amount must be used with operator" });
  }

  // Validate operator - must be used with amount
  if (operator !== undefined && amount === undefined) {
    return res.status(400).json({ error: "operator must be used with amount" });
  }

  // Validate operator - must be 'gte' or 'lte' if provided
  if (operator !== undefined && operator !== 'gte' && operator !== 'lte') {
    return res.status(400).json({ error: "operator must be either 'gte' or 'lte'" });
  }

  // Validate amount - must be a valid number if provided
  if (amount !== undefined) {
    const amountNum = Number(amount);
    if (isNaN(amountNum)) {
      return res.status(400).json({ error: "amount must be a valid number" });
    }
    filterBy.amount = amountNum;
  }

  // Validate page - must be a valid positive integer if provided
  let pageNum = 1; // default
  if (page !== undefined) {
    pageNum = Number(page);
    if (isNaN(pageNum) || !Number.isInteger(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: "page must be a positive integer (minimum 1)" });
    }
  }

  // Validate limit - must be a valid positive integer if provided
  let limitNum = 10; // default
  if (limit !== undefined) {
    limitNum = Number(limit);
    if (isNaN(limitNum) || !Number.isInteger(limitNum) || limitNum < 1) {
      return res.status(400).json({ error: "limit must be a positive integer (minimum 1)" });
    }
  }

  // Pagination
  const skip = (pageNum - 1) * limitNum;
  const take = limitNum;

  // Handle amount with operator
  if (amount !== undefined) {
    const amountNum = Number(amount);
    if (isNaN(amountNum)) {
      return res.status(400).json({ error: "amount must be a valid number" });
    }
    
    if (operator === 'gte') {
      filterBy.amount = { gte: amountNum };
    } else if (operator === 'lte') {
      filterBy.amount = { lte: amountNum };
    }
  }
  // Fetch the promotions
  try {
      // Prisma transaction to get count and paginated results
      const [count, transactions] = await prisma.$transaction([
          prisma.transaction.count({ where: filterBy }),
          prisma.transaction.findMany({
              where: filterBy,
              skip,
              take,
              include: {
                user: true,           // Include user (customer)
                createdBy: true       // Include creator (cashier/manager)
              }
          }),
      ]);

      const results = transactions.map(transaction => ({
        id: transaction.id,
        utorid: transaction.user.utorid,  // Get from included user
        amount: transaction.amount,
        type: transaction.type,
        spent: transaction.spent,
        promotionIds: transaction.promotionIds,
        suspicious: transaction.suspicious || false,
        remark: transaction.remark,
        createdBy: transaction.createdBy.utorid,  // Get from included creator
        ...(transaction.relatedId && { relatedId: transaction.relatedId }),  // Include if exists
        ...(transaction.type === 'redemption' && transaction.redeemed && { redeemed: transaction.redeemed })  // Include redeemed for redemptions

      }));

      // Respond with count and results
      return res.json({ count, results });

  } catch (err) {
      console.error('Error fetching transactions', err);
      return res.status(500).json({ message: 'Internal server error' });
  }

});


router.get("/:transactionId", authenticate, checkClearance('manager'), async (req, res) => {
  const transactionId = parseInt(req.params.transactionId);

  try {
    // Get the transaction from DB
    const transaction = await prisma.transaction.findFirst({
      where: {id: transactionId},
      include: {
        user: true,           // Include user (customer)
        createdBy: true       // Include creator (cashier/manager)
      }
    })

    if (!transaction) {
      return res.status(404).json({message: "transaction is not found"})
    }

    const result = {
      id: transaction.id,
      utorid: transaction.user.utorid,
      type: transaction.type,
      spent: transaction.spent,
      amount: transaction.amount,
      promotionIds: transaction.promotionIds,
      suspicious: transaction.suspicious,
      remark: transaction.remark,
      createdBy: transaction.createdBy.utorid
    }

    return res.status(200).json(result);
  } catch (err) {
      console.error("Error updating transaction", err);
      return res.status(500).json({ message: "Internal server error" });
  }
});

// Set or unset a transaction as being suspicious
router.patch("/:transactionId/suspicious", authenticate, checkClearance('manager'), async (req, res) => {
  const transactionId = parseInt(req.params.transactionId);
  const suspicious = req.body.suspicious;

  // Validate suspicious field
  if (suspicious !== undefined) {
    if (suspicious !== 'true' 
      && suspicious !== true
      && suspicious !== 'false'
      && suspicious !== false) {
      return res.status(400).json({ error: "suspicious must be a boolean value" });
    }
  } else {
    return res.status(400).json({ error: "suspicious field required" });
  }

  const suspiciousBool = true ? suspicious === "true" || suspicious === true : false;

  try {
    const updatedTransaction = await prisma.transaction.update({
      where: {id: transactionId},
      data: {suspicious: suspiciousBool},
      include: {
        user: true,           // Include user (customer)
        createdBy: true       // Include creator (cashier/manager)
      }
    });

    const result = {
      id: updatedTransaction.id,
      utorid: updatedTransaction.user.utorid,
      type: updatedTransaction.type,
      spent: updatedTransaction.spent,
      amount: updatedTransaction.amount,
      promotionIds: updatedTransaction.promotionIds,
      suspicious: updatedTransaction.suspicious,
      remark: updatedTransaction.remark,
      createdBy: updatedTransaction.createdBy.utorid
    }

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error updating transaction", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// Set a redemption transaction as being completed
router.patch("/:transactionId/processed", authenticate, checkClearance('cashier'), async (req, res) => {
  const currentUser = req.user;
  const transactionId = parseInt(req.params.transactionId);
  const processed = req.body.processed;

  // Validate processed field
  if (processed !== undefined) {
    if (processed !== 'true' 
      && processed !== true) {
      return res.status(400).json({ error: "processed can only be true" });
    }
  } else {
    return res.status(400).json({ error: "processed field required" });
  }

  try {
    // Check the transaction associated with id
    const currentTransaction = await prisma.transaction.findFirst({
      where: {id: transactionId}
    });

    if (!currentTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (currentTransaction.type !== "redemption") {
      return res.status(400).json({message: `transaction with id ${currentTransaction.id} is not type of redemption`})
    }

    if (currentTransaction.processedBy) {
      return res.status(400).json({message: `transaction with id ${currentTransaction.id} is already processed`})
    }
    
    // Update the transaction with associated id
    const updatedTransaction = await prisma.transaction.update({
      where: {id: transactionId},
      data: {processedBy: { 
        connect: { 
          id: currentUser.id 
        } 
      }},
      include: {
        user: true,           // Include user (customer)
        createdBy: true,       // Include creator (cashier/manager)
        processedBy: true     // Also include processedBy
      }
    });

    const result = {
      id: updatedTransaction.id,
      utorid: updatedTransaction.user.utorid,
      type: updatedTransaction.type,
      processedBy: updatedTransaction.processedBy.utorid,
      redeemed: updatedTransaction.redeemed,
      remark: updatedTransaction.remark,
      createdBy: updatedTransaction.createdBy.utorid
    }

    // After updating the transaction, deduct points from user
    const newPoints = updatedTransaction.user.points - updatedTransaction.amount;
    await prisma.user.update({
      where: {id: updatedTransaction.userId},
      data : {points: newPoints}
    })


    return res.status(200).json(result);

  } catch (err) {
    console.error("Error updating transaction", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// TODO: Implement the rest of transaction
module.exports = router;