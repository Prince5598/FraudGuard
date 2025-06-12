const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  transactionId:   { type: String, required: true, unique: true }, // trans_num
  transactionTime: { type: Date, required: true },                // trans_date_trans_time
  ccNum:           { type: String, required: true },              // cc_num, stored as string 
  transactionType: { type: String, required: true },              // trannsaction_type
  amount:          { type: Number, required: true },              // amt
  city:            { type: String },                              // city

  userLocation: {
    lat: { type: Number },
    lon: { type: Number },
  },

  merchantLocation: {
    lat: { type: Number },
    lon: { type: Number },
  },
  
  isFraud: { type: Boolean, default: false }, // is_fraud field
  
  fraudReason:     { type: [String] },  // Optional: from ML model
  fraudConfidence: { type: Number },  // Optional: from ML model

}, { timestamps: true });

module.exports = mongoose.models.transactionSchema || mongoose.model("Transaction", transactionSchema);
