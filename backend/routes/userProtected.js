const router = require("express").Router();
const authMiddleware = require("../middleware/auth");
const role = require("../middleware/role");
const Transaction = require("../model/Transaction");
const {User} = require("../model/User");
router.get("/dashboard", authMiddleware,role("user"),async (req, res) => {
  try {
    console.log("Fetching dashboard data for user:");
    const userId = req.user._id;
    const TotalTransactions = await Transaction.countDocuments({ userId }); 
   
    const latestTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(5); // Limit to 5 transactions
    const user = await User.findById({_id:userId});
   
    res.json({ recentTransactions : latestTransactions ,firstName : user.firstName ,total:TotalTransactions });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});


module.exports = router;
