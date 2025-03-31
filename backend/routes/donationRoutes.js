const express = require("express");
const multer = require("multer");
const path = require("path");
const { createDonationRequest, approveOrRejectDonationRequest, getAllDonationRequests,createDonationPayment,confirmDonation,getDonorsByDonationRequest,deleteDonationRequestIfDeadlinePassed } = require("../controllers/donationController");
const donationController = require("../controllers/donationDashboardController");


const router = express.Router();

// ✅ Configure Multer for Multiple File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/donations/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

// Multer upload configuration (allows multiple files)
const upload = multer({ storage });

// ✅ Create a New Donation Request (Supports Multiple Supporting Documents)
router.post("/newDonation", upload.array("supportingDocuments", 5), createDonationRequest);

// ✅ Approve or Reject a Donation Request (Admin Only)
router.put("/:requestId/status", approveOrRejectDonationRequest);
router.delete('/:requestId/deleteExp',deleteDonationRequestIfDeadlinePassed);
router.get("/all", getAllDonationRequests);
router.get("/:donationRequestId/donors", getDonorsByDonationRequest);
router.post("/donate", createDonationPayment);
router.post("/confirmDonation", confirmDonation);

// ✅ Serve Uploaded Files for Download
router.get("/uploads/donations/:filename", (req, res) => {
    const filePath = path.join(__dirname, "../uploads/donations/", req.params.filename);
    res.sendFile(filePath);
  });
router.get("/top-donors", donationController.getTopDonors);
router.get("/my-requests/:userId", donationController.getMyDonationRequests);
router.get("/my-donations/:userId", donationController.getMyDonations);
router.get("/getAll", donationController.getAllDonations);

  
module.exports = router;
