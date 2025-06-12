const router = require('express').Router();
const { User } = require('../model/User');
const { Admin } = require('../model/Admin');

router.get('/user', async (req, res) => {
    try {
        console.log("Logout:");
        const refreshToken = req.cookies.UserrefreshToken;
        if (!refreshToken) return res.status(400).send("No token provided");
    
        const user = await User.findOne({ UserrefreshToken : refreshToken });
        if (!user) return res.status(400).send("Invalid token");

        user.UserrefreshToken = null;
        await user.save();

        res.clearCookie("UserrefreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/"
        });
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/admin', async (req, res) => {
    console.log("Admin Logout:");
    const refreshToken = req.cookies.AdminrefreshToken;
    if (!refreshToken) return res.status(400).send("No token provided");

    const admin = await Admin.findOne({ AdminrefreshToken : refreshToken });
    if (!admin) return res.status(400).send("Invalid token");

    admin.AdminrefreshToken = null;
    await admin.save();
    try {
        res.clearCookie("AdminrefreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/"
        });
        return res.status(200).json({ message: "Admin logged out successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;