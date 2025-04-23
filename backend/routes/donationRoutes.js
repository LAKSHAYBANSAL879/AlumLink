const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { 
  createDonationRequest, 
  approveOrRejectDonationRequest, 
  getAllDonationRequests,
  createDonationPayment,
  confirmDonation,
  getDonorsByDonationRequest,
  deleteDonationRequestIfDeadlinePassed 
} = require("../controllers/donationController");
const donationController = require("../controllers/donationDashboardController");

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "donations",
    resource_type: "auto",
  }
});

// Multer upload configuration with Cloudinary storage
const upload = multer({ storage });

// Create a New Donation Request (Supports Multiple Supporting Documents)
router.post("/newDonation", upload.array("supportingDocuments", 5), createDonationRequest);

// Approve or Reject a Donation Request (Admin Only)
router.put("/:requestId/status", approveOrRejectDonationRequest);

// Delete expired donation requests
router.delete('/:requestId/deleteExp', deleteDonationRequestIfDeadlinePassed);

// Get all donation requests
router.get("/all", getAllDonationRequests);

// Get donors by donation request
router.get("/:donationRequestId/donors", getDonorsByDonationRequest);

// Create and confirm donations
router.post("/donate", createDonationPayment);
router.post("/confirmDonation", confirmDonation);

// Dashboard routes
router.get("/top-donors", donationController.getTopDonors);
router.get("/my-requests/:userId", donationController.getMyDonationRequests);
router.get("/my-donations/:userId", donationController.getMyDonations);
router.get("/getAll", donationController.getAllDonations);

module.exports = router;