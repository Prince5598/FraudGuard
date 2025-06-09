const mongoose = require("mongoose");
require("dotenv").config();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const passComplexity = require("joi-password-complexity");

const adminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true }, // hashed password
  AdminrefreshToken: { type: String },
}, { timestamps: true });


adminSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, email: this.email, role: 'admin', firstName: this.firstName  }, // you can add a role or any other claims
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return token;
};

// Generate refresh token
adminSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    { _id: this._id, email: this.email, role: 'admin' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '5h' }
  );
  return refreshToken;
};

const validateAdmin = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(30).required().label("First Name"),
        lastName: Joi.string().min(3).max(30).required().label("Last Name"),
        email: Joi.string().email().required().label("Email"),
        password: passComplexity().required().label("Password"),
    });
    return schema.validate(data);
}

const Admin =   mongoose.models.adminSchema || mongoose.model("Admin", adminSchema);

module.exports = { Admin, validateAdmin };