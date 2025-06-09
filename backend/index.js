const express = require('express');
const app = express();
const db = require('./config/Db');
const cors = require('cors');
const cookieParser = require("cookie-parser");

const userAuthRoutes = require('./routes/userAuth');
const authMiddleware = require('./middleware/auth');
const adminAuthRoutes = require('./routes/adminAuth'); 
const RefreshRoutes = require('./routes/refresh');
const LogoutRoutes = require('./routes/logout');
const userProtectedRoutes = require('./routes/userProtected');
const adminProtectedRoutes = require('./routes/adminProtected');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoute');

require('dotenv').config();
db.connect();
app.use(cors({ origin: 'http://localhost:5173', credentials: true,exposedHeaders: ['Authorization'], }));

app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 5000;

app.use('/api/user', userAuthRoutes);
app.use('/api/admin', adminAuthRoutes);

app.use('/api', RefreshRoutes);

app.use('/api/logout', LogoutRoutes);

app.use("/api/user", userProtectedRoutes);
app.use("/api/admin", adminProtectedRoutes);

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/protected", authMiddleware, (req, res) => {
    res.status(200).json({
        message: 'Access granted with token',
        user: req.user // You can send any user-related data here
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});