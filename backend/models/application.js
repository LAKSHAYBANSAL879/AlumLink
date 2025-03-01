const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resume: { type: String, required: true }, // Store file path or URL
  coverLetter: { type: String },
  status: {
    type: String,
    enum: ["Applied", "Shortlisted", "Rejected", "Hired"],
    default: "Applied"
  },
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Application", applicationSchema);