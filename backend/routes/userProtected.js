const router = require("express").Router();
const authMiddleware = require("../middleware/auth");
const role = require("../middleware/role");
const Transaction = require("../model/Transaction");
router.get("/dashboard", authMiddleware,async (req, res) => {
  try {
    console.log("Fetching dashboard data for user:");
    const userId = req.user._id;
    console.log("User ID:", userId);
    const latestTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(5); // Limit to 5 transactions

    res.json({ recentTransactions : latestTransactions });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});


module.exports = router;
