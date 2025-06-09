const router = require('express').Router();
const { User } = require("../model/User")
const authMiddleware = require("../middleware/auth");
const Transaction = require("../model/Transaction");
const role = require("../middleware/role");
router.get('/AllUsers', authMiddleware, async (req, res) => {
  // if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    console.log("Users");
    const users = await User.find({}, '-password'); // hide password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.get('/search-user', authMiddleware, async (req, res) => {
  try {
    const { email, firstName, lastName } = req.query;
    const query = {};

    if (email) query.email = email;
    if (firstName) query.firstName = new RegExp(firstName, 'i');
    if (lastName) query.lastName = new RegExp(lastName, 'i');

    const users = await User.find(query, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'User search failed' });
  }
});

router.get('/advanced-transactions-filter', authMiddleware, async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      userId,
      transactionType,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      isFraud,
      city,
    } = req.query;

    const userQuery = {};
    const userFilterApplied = email || firstName || lastName;

    if (email) userQuery.email = email;
    if (firstName) userQuery.firstName = new RegExp(firstName, 'i');
    if (lastName) userQuery.lastName = new RegExp(lastName, 'i');

    let userIds = [];

    if (userId) {
      userIds.push(userId);
    } else if (userFilterApplied) {
      const users = await User.find(userQuery, '-password');
      if (!users.length) {
        return res.status(404).json({ message: "No matching users found" });
      }
      userIds = users.map(user => user._id);
    }

    // Now build the transaction filter
    const txnQuery = {};

    if (userIds.length) txnQuery.userId = { $in: userIds };
    if (transactionType) txnQuery.transactionType = transactionType;

    if (minAmount || maxAmount) {
      txnQuery.amount = {};
      if (minAmount) txnQuery.amount.$gte = parseFloat(minAmount);
      if (maxAmount) txnQuery.amount.$lte = parseFloat(maxAmount);
    }

    if (startDate || endDate) {
      txnQuery.transactionTime = {};
      if (startDate) txnQuery.transactionTime.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // to include entire end day
        txnQuery.transactionTime.$lte = end;
      }
    }

    if (typeof isFraud !== "undefined") {
      txnQuery.isFraud = isFraud === "true";
    }

    if (city) {
      txnQuery.city = new RegExp(city, 'i');
    }

    const transactions = await Transaction
  .find(txnQuery)
  .populate("userId", "-password")
  .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (err) {
    console.error("Error in advanced transaction filter:", err);
    res.status(500).json({ message: "Server error during filtering" });
  }
});

router.get('/statistics-summary', authMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalFrauds = await Transaction.countDocuments({ isFraud: true });

    const fraudRate = totalTransactions > 0 ? (totalFrauds / totalTransactions) * 100 : 0;

    const transactionsByCity = await Transaction.aggregate([
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          city: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } } // optional: sort by transaction count
    ]);
    const transactionsByType = await Transaction.aggregate([
      {
        $group: {
          _id: '$transactionType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tx24h = await Transaction.countDocuments({ createdAt: { $gte: oneDayAgo } });

    const totaltransactions = await Transaction.countDocuments();
    const totalUsersWithTx = await Transaction.distinct("userId");
    const avgTxPerUser = totalUsersWithTx.length > 0 ? (totaltransactions / totalUsersWithTx.length).toFixed(0) : 0;

    const blockedUsers = await User.countDocuments({ isBlocked: true });

    const avgAgg = await Transaction.aggregate([
      { $group: { _id: null, avgAmount: { $avg: "$amount" } } }
    ]);
    const avgTransactionAmount = avgAgg[0]?.avgAmount.toFixed(2) || 0;


    console.log(transactionsByType);
    res.json({
      avgTransactionAmount,
      blockedUsers,
      tx24h,
      avgTxPerUser,
      totalUsers,
      totalTransactions,
      totalFrauds,
      transactionsByCity,
      transactionsByType,
      fraudRate: fraudRate.toFixed(2),
    });
  } catch (err) {
    console.error('Statistics summary error:', err);
    res.status(500).json({ message: 'Error fetching summary stats' });
  }
});

module.exports = router;
