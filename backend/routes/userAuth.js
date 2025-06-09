const router = require('express').Router();
const {User,validate} = require('../model/User');
const bcrypt = require('bcrypt');
const Joi = require('joi');

router.post('/signup', async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
        }).save();
        res.status(200).send("User registered successfully");
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
})

router.post('/login', async (req, res) => {
    try{
        const { error } = validatelogin(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send('Invalid email or password');
        
        const validpass = await bcrypt.compare(req.body.password, user.password);
        if (!validpass) return res.status(400).send('Invalid email or password');
        
        const token = await user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();
        user.UserrefreshToken = refreshToken;
        
        await user.save();
        
        res.cookie("UserrefreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
        }).status(200).send({
            data: token,
            message: 'Logged in successfully',
        })

    } catch (error) {
        res.status(500).send('Internal Server Error');
        console.log(error);
    }
});

const validatelogin = (data) => {
	const schema = Joi.object({
		email: Joi.string().email().required().label("Email"),
		password: Joi.string().required().label("Password"),
	});
	return schema.validate(data);
};

module.exports = router;