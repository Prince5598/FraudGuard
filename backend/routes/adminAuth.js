const router = require('express').Router();
const {Admin, validateAdmin} = require('../model/Admin');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
require("dotenv").config();
router.post('/signup', async (req, res) => {
    try {
        const { error } = validateAdmin(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const adminExists = await Admin.findOne({ email: req.body.email });
        if (adminExists) return res.status(400).json({ message: 'Admin already exists' });

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newAdmin = new Admin({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
        });

        await newAdmin.save();
        res.status(200).send("Admin registered successfully");
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        // Validation schema
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const admin = await Admin.findOne({ email: req.body.email });
        if (!admin) return res.status(400).send('Invalid email or password');

        const validPass = await bcrypt.compare(req.body.password, admin.password);
        if (!validPass) return res.status(400).send('Invalid email or password');

        // Generate tokens (implement methods in admin model similar to user model)
        const token = admin.generateAuthToken();
        const refreshToken = admin.generateRefreshToken();

        admin.AdminrefreshToken = refreshToken;
        await admin.save();
        
        res.cookie("AdminrefreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/",
        }).status(200).send({
            data: token,
            message: 'Admin logged in successfully',
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;