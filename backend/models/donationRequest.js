const mongoose=require('mongoose')
const DonationRequestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category:{type:String},
    description: { type: String, required: true },
    amountRequired: { type: Number, required: true },
    amountRaised: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    supportingDocuments: [{ type: String }],
    adminRemarks: { type: String},
    createdAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model("DonationRequest", DonationRequestSchema);
  