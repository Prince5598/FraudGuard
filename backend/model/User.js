const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  firstName:  { type: String, required: true },
  lastName:   { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },  // hashed password
  UserrefreshToken:      { type: String },                   // JWT or refresh token                 // Optional user IP
  isBlocked: {
    type: Boolean,
    default: false
}
   // block user access flag
}, { timestamps: true });

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, email: this.email,role:'user',firstName : this.firstName, lastName: this.lastName }, process.env.JWT_SECRET, {
        expiresIn: "1hr",
    });
    return token;
}
userSchema.methods.generateRefreshToken = function () {
    const refreshToken = jwt.sign(
        { _id: this._id, email: this.email,role:'user',firstName : this.firstName, lastName: this.lastName },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '5hr' } 
    );
    return refreshToken;
};
const User =  mongoose.model("User", userSchema);

const validate = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(30).required().label("First Name"),
        lastName: Joi.string().min(3).max(30).required().label("Last Name"),
        email: Joi.string().email().required().label("Email"),
        password: passComplexity().required().label("Password"),
    });
    return schema.validate(data);
}

module.exports = {User, validate};
