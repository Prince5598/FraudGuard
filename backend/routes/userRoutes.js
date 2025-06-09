const router = require('express').Router();
const { User } = require('../model/User');
const Transaction = require('../model/Transaction');
const authMiddleware = require('../middleware/auth');
const role = require('../middleware/role');
const { Parser } = require('json2csv');
const axios = require('axios');

router.get("/profile", authMiddleware, role("user"), async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -UserrefreshToken");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.put('/profile',authMiddleware,role("user"), async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = {};
    const { firstName, lastName } = req.body;

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/form-transaction',authMiddleware,role("user"), async (req, res) => {
  try {
    console.log("Form Transaction:", req.body);
    const userId = req.user._id;
    const {
      transactionId,
      transactionTime,
      ccNum,
      transactionType,
      amount,
      city,
      userLocation,
      merchantLocation,
    } = req.body;

    if (!transactionId || !transactionTime || !ccNum || !transactionType || !amount) {
      return res.status(400).json({ message: "Missing required transaction fields" });
    }

    // Prepare data for ML API (Flask)
    const flaskInput = {
      transactionTime,
      ccNum,
      transactionType,
      amount,
      city: city || "",
      userLocation: {
        lat: userLocation?.lat || 0,
        lon: userLocation?.lon || 0,
      },
      merchantLocation: {
        lat: merchantLocation?.lat || 0,
        lon: merchantLocation?.lon || 0,
      },
      transactionId
    };

    // Call Flask prediction API
    const flaskRes = await axios.post('http://localhost:5001/predict', flaskInput);
    const { is_fraud, confidence, fraud_reason } = flaskRes.data;

    if(is_fraud){
        const fraudCount = await Transaction.countDocuments({ userId, isFraud: true });
        if (fraudCount > 10) {
            await User.findByIdAndUpdate(userId, { isBlocked: true });
        }
    }
    // Save transaction with ML prediction results
    const newTransaction = new Transaction({
      userId,
      transactionId,
      transactionTime,
      ccNum,
      transactionType,
      amount,
      city,
      userLocation,
      merchantLocation,
      isFraud: is_fraud,
      fraudReason: fraud_reason,
      fraudConfidence: confidence,
    });

    await newTransaction.save();
    console.log("Transaction saved:", newTransaction);
    res.status(201).json({ message: "Transaction reported successfully" });
  } catch (error) {
    console.error("Error in /report-fraud:", error.message);
    res.status(500).json({ message: "Server error while reporting transaction" });
  }
});


router.get('/transactions',authMiddleware,role("user"), async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ userId })
      .select('-isFraud -fraudReason -fraudConfidence -__v') // exclude fraud fields and __v
      .sort({ transactionTime: -1 }); // sort by latest
    console.log("Fetched transactions for user:",transactions.length);
    res.status(200).json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
});

router.get('/download-transactions',authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ userId }).lean();

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found' });
    }

    // Remove internal fraud details
    const sanitized = transactions.map(t => ({
      transactionId: t.transactionId,
      transactionTime: t.transactionTime,
      ccNum: t.ccNum,
      transactionType: t.transactionType,
      amount: t.amount,
      city: t.city,
      userLat: t.userLocation?.lat || '',
      userLon: t.userLocation?.lon || '',
      merchantLat: t.merchantLocation?.lat || '',
      merchantLon: t.merchantLocation?.lon || ''
    }));

    // Convert to CSV
    const fields = [
      'transactionId',
      'transactionTime',
      'ccNum',
      'transactionType',
      'amount',
      'city',
      'userLat',
      'userLon',
      'merchantLat',
      'merchantLon'
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(sanitized);

    // Set response headers for file download
    res.header('Content-Type', 'text/csv');
    res.attachment('my_transactions.csv');
    return res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error downloading transactions' });
  }
});


module.exports = router;


