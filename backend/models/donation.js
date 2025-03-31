const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donationRequest: { type: mongoose.Schema.Types.ObjectId, ref: "DonationRequest", required: true }, // Linked request
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Donor
  amountDonated: { type: Number, required: true }, // Donation amount
  timestamp: { type: Date, default: Date.now } // Donation time
});

module.exports = mongoose.model("Donation", donationSchema);