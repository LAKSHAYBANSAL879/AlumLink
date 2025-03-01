const express = require("express");
const multer = require("multer");
const path = require("path");
const { applyForJob, updateApplicationStatus, getUserAppliedJobs,getApplicationsForJob, getApplicationsByEmployer } = require("../controllers/applicatiionController");

const router = express.Router();

// ✅ Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["application/pdf"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDF files are allowed"), false);
    }
    cb(null, true);
  },
});


router.post("/apply", upload.fields([{ name: "resume" }, { name: "coverLetter" }]), applyForJob);
router.put("/update-status", updateApplicationStatus);
router.post("/getAppliedJobs", getUserAppliedJobs);
router.post("/getApplicationEmployer", getApplicationsByEmployer);

router.get("/getApplications/:jobId", getApplicationsForJob);



// ✅ Serve Uploaded Files for Download
router.get("/uploads/resumes/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads/resumes/", req.params.filename);
  res.download(filePath);
});

module.exports = router;
