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
  const transactionRemark = req.body.remark || '';

  // Basic validation
  if (!customerUtorid || !transactionType)
    return res.status(400).json({ message: "Missing required fields" });

  if (typeof customerUtorid !== 'string' || customerUtorid.trim() === '')
    return res.status(400).json({ message: "UTORid must be a non-empty string" });

  if (!["purchase", "adjustment"].includes(transactionType))
    return res.status(400).json({ message: "Invalid transaction type" });

  try {
    // Current user (cashier/manager) info
    const user = await prisma.user.findFirst({ where: { id: currentUser.id } });
    if (!user) return res.status(404).json({ message: "User creating transaction not found" });

    // Customer info
    const customer = await prisma.user.findFirst({ where: { utorid: customerUtorid } });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (transactionType === "purchase") {
      // Purchase-specific fields
      const transactionSpent = parseFloat(req.body.spent);
      const transactionPromotionIds = req.body.promotionIds;

      if (transactionSpent === undefined)
        return res.status(400).json({ message: "Missing required field: spent" });
      if (isNaN(transactionSpent) || transactionSpent <= 0)
        return res.status(400).json({ message: "Spent must be a positive numeric value" });
      if (transactionPromotionIds && !Array.isArray(transactionPromotionIds))
        return res.status(400).json({ message: "promotionIds must be an array" });

      if (!["cashier", "manager", "superuser"].includes(currentUser.role))
        return res.status(403).json({ message: "Forbidden" });

      // Validate promotions
      let promotions = [];
      if (transactionPromotionIds?.length) {
        promotions = await prisma.promotion.findMany({
          where: { id: { in: transactionPromotionIds } }
        });

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

      // --- POINT CALCULATION ---

      // Base points: 1 point per $0.25 spent
      const baseEarned = Math.round(transactionSpent / 0.25);
      let totalEarned = baseEarned;

      // Apply promotional points
      promotions.forEach(p => {
        if (p.rate) {
          // Extra points = transactionSpent * rate * 100
          totalEarned += Math.round(transactionSpent * p.rate * 100);
        } else if (p.points) {
          totalEarned += p.points;
        }
      });

      // Create purchase transaction
      const transaction = await prisma.transaction.create({
        data: {
          type: "purchase",
          spent: transactionSpent,
          amount: totalEarned,
          remark: transactionRemark,
          promotions: { connect: transactionPromotionIds?.map(id => ({ id })) || [] },
          createdBy: { connect: { id: currentUser.id } },
          user: { connect: { id: customer.id } }
        },
        include: { promotions: true }
      });

      // Update customer points
      if (!user.suspicious) {
        await prisma.user.update({
          where: { id: customer.id },
          data: { points: customer.points + totalEarned }
        });
      }

      // Mark promotions as used
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
        promotions: transaction.promotions.map(p => ({ id: p.id, name: p.name, description: p.description })),
        createdBy: user.utorid,
        createdAt: transaction.createdAt
      });

    } else if (transactionType === "adjustment") {
      // Adjustment-specific logic
      if (!["manager", "superuser"].includes(currentUser.role))
        return res.status(403).json({ message: "Forbidden" });

      const adjustmentAmount = parseInt(req.body.amount);
      const adjustmentRelatedId = req.body.relatedId;

      if (adjustmentAmount === undefined || isNaN(adjustmentAmount))
        return res.status(400).json({ message: "Missing or invalid field: amount" });
      if (!adjustmentRelatedId)
        return res.status(400).json({ message: "Missing required field: relatedId" });

      const relatedTransaction = await prisma.transaction.findUnique({
        where: { id: adjustmentRelatedId }
      });
      if (!relatedTransaction)
        return res.status(400).json({ message: "Related transaction not found" });

      const newBalance = customer.points + adjustmentAmount;
      if (newBalance < 0)
        return res.status(400).json({ message: `Adjustment would result in negative balance (${newBalance}). Current balance: ${customer.points}` });

      const transaction = await prisma.transaction.create({
        data: {
          type: "adjustment",
          amount: adjustmentAmount,
          relatedId: adjustmentRelatedId,
          remark: transactionRemark,
          spent: 0,
          createdBy: { connect: { id: currentUser.id } },
          user: { connect: { id: customer.id } }
        }
      });

      // Update customer points
      await prisma.user.update({
        where: { id: customer.id },
        data: { points: newBalance }
      });

      return res.status(201).json({
        id: transaction.id,
        utorid: customer.utorid,
        amount: transaction.amount,
        type: transaction.type,
        relatedId: transaction.relatedId,
        remark: transaction.remark,
        createdBy: user.utorid,
        createdAt: transaction.createdAt
      });
    }

    return res.status(400).json({ message: "Invalid transaction type" });
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
    return res.status(400).json({ error: "Amount must be used with operator" });
  }

  // Validate operator - must be used with amount
  if (operator !== undefined && amount === undefined) {
    return res.status(400).json({ error: "Operator must be used with amount" });
  }

  // Validate operator - must be 'gte' or 'lte' if provided
  if (operator !== undefined && operator !== 'gte' && operator !== 'lte') {
    return res.status(400).json({ error: "Operator must be either 'gte' or 'lte'" });
  }

  // Validate amount - must be a valid number if provided
  if (amount !== undefined) {
    const amountNum = Number(amount);
    if (isNaN(amountNum)) {
      return res.status(400).json({ error: "Amount must be a valid number" });
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
              },
              orderBy: {
                createdAt: "desc", // or "asc"
              },
          }),
      ]);

      const results = await Promise.all(
        transactions.map(async (transaction) => {
          // Prepare sender/recipient for transfers
          let sender = null;
          let recipient = null;

          if (transaction.type === "transfer" && transaction.relatedId) {
            // Fetch the related user
            const relatedUser = await prisma.user.findUnique({
              where: { id: transaction.relatedId },
              select: { utorid: true }
            });

            if (relatedUser) {
              if (transaction.amount < 0) {
                // Primary user sent points
                sender = transaction.user.utorid;
                recipient = relatedUser.utorid;
              } else {
                // Primary user received points
                sender = relatedUser.utorid;
                recipient = transaction.user.utorid;
              }
            }
          }

          return {
            id: transaction.id,
            utorid: transaction.user.utorid,
            amount: transaction.amount,
            type: transaction.type,
            spent: transaction.spent,
            promotionIds: transaction.promotionIds,
            suspicious: transaction.suspicious || false,
            remark: transaction.remark,
            createdBy: transaction.createdBy.utorid,

            // Add sender/recipient if transfer
            ...(sender && { sender }),
            ...(recipient && { recipient }),

            ...(transaction.relatedId && { relatedId: transaction.relatedId }),
            ...(transaction.type === "redemption" &&
              transaction.redeemed && { redeemed: transaction.redeemed }),
          };
        })
      );

      // Respond with count and results
      return res.json({ count, results });

  } catch (err) {
      console.error('Error fetching transactions', err);
      return res.status(500).json({ message: 'Internal server error' });
  }

});

// Get transaction by id
router.get("/:transactionId", authenticate, checkClearance('manager'), async (req, res) => {
  const transactionId = parseInt(req.params.transactionId);

  if (isNaN(transactionId)) {
    return res.status(400).json({ message: "Invalid transaction ID" });
  }

  try {
    // Fetch transaction with related users
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId },
      include: {
        user: true,       // The primary user
        createdBy: true,  // Creator (cashier/manager)
        processedBy: true // Processor (cashier/manager)
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    let sender = null;
    let recipient = null;

    // If it's a transfer, determine sender/recipient based on amount & relatedId
    if (transaction.type === "transfer" && transaction.relatedId) {
      const relatedUser = await prisma.user.findUnique({
        where: { id: transaction.relatedId },
        select: { utorid: true }
      });

      if (relatedUser) {
        if (transaction.amount < 0) {
          // Primary user sent points
          sender = transaction.user.utorid;
          recipient = relatedUser.utorid;
        } else {
          // Primary user received points
          sender = relatedUser.utorid;
          recipient = transaction.user.utorid;
        }
      }
    }

    const result = {
      id: transaction.id,
      utorid: transaction.user?.utorid || "Unknown",
      type: transaction.type,
      spent: transaction.spent,
      amount: transaction.amount,
      promotionIds: transaction.promotionIds,
      suspicious: transaction.suspicious || false,
      remark: transaction.remark,
      createdAt: transaction.createdAt,
      createdBy: transaction.createdBy?.utorid || "Unknown",
      processedBy: transaction.processedBy?.utorid || null,
      ...(sender && { sender }),
      ...(recipient && { recipient }),
      ...(transaction.relatedId && { relatedId: transaction.relatedId }),
      ...(transaction.type === "redemption" && transaction.redeemed && { redeemed: transaction.redeemed })
    };

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error fetching transaction", err);
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
  if (processed === undefined) {
    return res.status(400).json({ error: "processed field required" });
  }
  if (processed !== true && processed !== "true") {
    return res.status(400).json({ error: "processed can only be true" });
  }

  try {
    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, createdBy: true, processedBy: true }
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.type !== "redemption") {
      return res.status(400).json({ message: `Transaction ${transactionId} is not a redemption` });
    }

    if (transaction.processedBy) {
      return res.status(400).json({ message: `Transaction ${transactionId} is already processed` });
    }

    // Amount to deduct is negative
    const pointsToDeduct = transaction.amount;

    if (transaction.user.points + pointsToDeduct < 0) {
      return res.status(400).json({ message: "Insufficient points" });
    }

    // Update transaction as processed
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { processedBy: { connect: { id: currentUser.id } } },
      include: { user: true, createdBy: true, processedBy: true }
    });

    // Deduct points
    await prisma.user.update({
      where: { id: transaction.userId },
      data: { points: transaction.user.points + pointsToDeduct }
    });

    // Return result
    return res.status(200).json({
      id: updatedTransaction.id,
      utorid: updatedTransaction.user.utorid,
      type: updatedTransaction.type,
      processedBy: updatedTransaction.processedBy.utorid,
      redeemed: pointsToDeduct,
      remark: updatedTransaction.remark,
      createdBy: updatedTransaction.createdBy.utorid
    });

  } catch (err) {
    console.error("Error processing redemption:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;