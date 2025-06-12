const jwt = require('jsonwebtoken');
require("dotenv").config();
const { User } = require("../model/User");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth Header:", authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Decoded User:", req.user);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
module.exports = authMiddleware;
