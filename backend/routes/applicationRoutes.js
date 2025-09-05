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


router.get("/uploads/resumes/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const fs = require('fs');
    
    // Check if file exists locally
    const localFilePath = path.join(__dirname, "../uploads/resumes/", filename);
    
    if (fs.existsSync(localFilePath)) {
      // File exists locally - serve it with proper headers for inline viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      res.sendFile(localFilePath);
    } else {
      // File doesn't exist locally, try Cloudinary
      const publicId = `resumes/${filename.replace('.pdf', '')}`;
      
      const fileUrl = cloudinary.url(publicId, {
        resource_type: 'auto',
        flags: 'attachment:false'
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      res.redirect(fileUrl);
    }
    
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

router.get("/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const fs = require('fs');
    
    // First, check if file exists locally
    const localFilePath = path.join(__dirname, "../uploads/resumes/", filename);
    
    if (fs.existsSync(localFilePath)) {
      // File exists locally - serve it with proper headers for inline viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      res.sendFile(localFilePath);
    } else {
      // File doesn't exist locally, try Cloudinary
      const publicId = `resumes/${filename.replace('.pdf', '')}`;
      
      // Get the file URL from Cloudinary
      const fileUrl = cloudinary.url(publicId, {
        resource_type: 'auto',
        flags: 'attachment:false'
      });
      
      // Set headers for inline PDF viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      // Redirect to Cloudinary URL
      res.redirect(fileUrl);
    }
    
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router;