const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const role = require('../middleware/role');

router.get("/panel", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to the Admin Panel", admin: req.user });
});

module.exports = router;
