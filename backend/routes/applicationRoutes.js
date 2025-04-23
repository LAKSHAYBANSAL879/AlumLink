const express = require("express");
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { applyForJob, updateApplicationStatus, getUserAppliedJobs, getApplicationsForJob, getApplicationsByEmployer } = require("../controllers/applicatiionController");

const router = express.Router();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "resumes",
    allowed_formats: ["pdf"],
    resource_type: "auto",
  }
});


// File filter for PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF files are allowed"), false);
  }
  cb(null, true);
};


const cloudUpload = multer({ 
  storage: cloudinaryStorage,
  fileFilter: fileFilter
});

router.post("/apply", cloudUpload.fields([{ name: "resume" }, { name: "coverLetter" }]), applyForJob);
router.put("/update-status", updateApplicationStatus);
router.post("/getAppliedJobs", getUserAppliedJobs);
router.post("/getApplicationEmployer", getApplicationsByEmployer);
router.get("/getApplications/:jobId", getApplicationsForJob);


router.get("/uploads/resumes/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads/resumes/", req.params.filename);
  res.download(filePath);
});

module.exports = router;