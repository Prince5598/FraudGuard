const router = require('express').Router();
const { User } = require('../model/User');
const { Admin } = require('../model/Admin');
const jwt = require('jsonwebtoken');
require("dotenv").config();

router.get('/user/refresh-token', async (req, res) => {
    const oldrefreshToken = req.cookies.UserrefreshToken;
    console.log("Old Refresh Token:", oldrefreshToken);
    if(!oldrefreshToken) {
        return res.status(401).send("Refresh token not found");
    }
    try {
        const decoded = jwt.verify(oldrefreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded._id);
        if (!user || user.UserrefreshToken !== oldrefreshToken) {
            return res.status(403).send("Invalid refresh token");
        }
        const newRefreshToken = user.generateRefreshToken();
        user.UserrefreshToken = newRefreshToken;
        await user.save();
        
        const newAccessToken = user.generateAuthToken();
        
        res.cookie("UserrefreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
        });
        res.status(200).send({ data: newAccessToken });
    } catch (error) {
        return res.status(403).send("Invalid refresh token");
    }
})

router.get('/admin/refresh-token', async (req, res) => {
    const oldrefreshToken = req.cookies.AdminrefreshToken;
    if(!oldrefreshToken) {
        return res.status(401).send("Refresh token not found");
    }
    try {
        const decoded = jwt.verify(oldrefreshToken, process.env.JWT_REFRESH_SECRET);
        const admin = await Admin.findById(decoded._id);
        if (!admin || admin.AdminrefreshToken !== oldrefreshToken) {
            return res.status(403).send("Invalid refresh token");
        }
        const newRefreshToken = admin.generateRefreshToken();
        admin.AdminrefreshToken = newRefreshToken;
        await admin.save();
        const newAccessToken = admin.generateAuthToken();
        
        res.cookie("AdminrefreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
        });
        res.status(200).send({ data: newAccessToken });
    } catch (error) {
        return res.status(403).send("Invalid refresh token");
    }
});

module.exports = router;