const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  about: { type: String }, // About the job/company
  company: { type: String, required: true },
  location: [{ type: String, required: true }], // Array for multiple locations
  salaryRange: { type: String },
  companyImageUrl:{type:String},
  employmentType: { type: String, enum: ["Full-time", "Part-time", "Internship"], required: true },
  category: { type: String, required: true }, // Job category (IT, Finance, etc.)
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // List of users who applied
  skillsRequired: [{ type: String }],
  experienceLevel: { type: String, enum: ["Fresher", "1-3 years", "3+ years"], required: true },
  applicationDeadline: { type: Date },
  maxApplicants:{type:Number},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", jobSchema);
