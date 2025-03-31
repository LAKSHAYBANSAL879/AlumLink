const DonationRequest = require("../models/donationRequest");
const Donation = require("../models/donation");
const stripe = require("stripe")(process.env.STRIPE_SECRET); 
const User=require("../models/User")
const Notification=require("../models/notification")
;
// ✅ Create a new donation request
const createDonationRequest = async (req, res) => {
  try {
    const { title, description, amountRequired, deadline, createdBy,category } = req.body;
    const supportingDocuments = req.files ? req.files.map(file => file.path) : [];

    const donationRequest = new DonationRequest({
      title,
      description,
      amountRequired,
      deadline,
      createdBy,
      supportingDocuments,
      category
    });

    await donationRequest.save();
    res.json({ message: "Donation request submitted for approval", donationRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Approve or Reject a donation request
const approveOrRejectDonationRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminRemarks, adminId } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'." });
    }

    const donationRequest = await DonationRequest.findById(requestId);
    if (!donationRequest) {
      return res.status(404).json({ message: "Donation request not found" });
    }

    if (donationRequest.status !== "pending") {
      return res.status(400).json({ message: "This donation request has already been processed." });
    }

    donationRequest.status = status;
    donationRequest.adminRemarks = adminRemarks;
    donationRequest.verifiedBy = adminId;
    await donationRequest.save();

    res.json({ message: `Donation request ${status} successfully`, donationRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const createDonationPayment = async (req, res) => {
    try {
      const { amount, donationRequestId, donorId } = req.body;
  
      if (!amount || !donationRequestId || !donorId) {
        return res.status(400).json({ message: "Missing required fields." });
      }
  
      const donationRequest = await DonationRequest.findById(donationRequestId);
      if (!donationRequest) {
        return res.status(404).json({ message: "Donation request not found." });
      }
  
      // ✅ Create Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert amount to cents
        currency: "inr",
        metadata: { donationRequestId, donorId },
      });
  
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Stripe Error:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };
  
  // ✅ Confirm Payment & Save Donation Record
  const confirmDonation = async (req, res) => {
    try {
      const { donationRequestId, donorId, amount } = req.body;
  
      if (!donationRequestId || !donorId || !amount) {
        return res.status(400).json({ message: "Missing required fields." });
      }
  
      // ✅ Save donation record
      const donation = new Donation({
        donationRequest: donationRequestId,
        donor: donorId,
        amountDonated: amount,
      });
  
      await donation.save();
  
      await DonationRequest.findByIdAndUpdate(donationRequestId, {
        $inc: { amountRaised: amount },
      });
  
      res.json({ message: "Donation successful", donation });

      const donationRequest = await DonationRequest.findById(donationRequestId);
      const donors = await User.findById(donorId);
      if (donationRequest && donationRequest.createdBy) {
        const notification = new Notification({
          userId: donationRequest.createdBy, // Campaign owner receives the notification
          type: 'donation',
          title: donationRequest.title,
          message: `${donors.name} donated Rs${amount} to your campaign`,
          sourceId: donation._id,
          refModel: 'Donation',
          sourceName: donors.name
        });
        
        const savedNotification = await notification.save();
        
        // Emit real-time notification
        if (req.app.io) {
          req.app.io.to(`user-${donationRequest.createdBy}`).emit('new_notification', savedNotification);
        }
      }
      
    } catch (error) {
      console.error("Error confirming donation:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };
// ✅ Get all donation requests
const getAllDonationRequests = async (req, res) => {
  try {
    const donationRequests = await DonationRequest.find().populate('createdBy');
    res.json(donationRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// ✅ Delete donation request if goal is met
const deleteDonationRequestIfDeadlinePassed = async () => {
  const {requestId}=req.params;
  try {
    const donationRequest = await DonationRequest.findById(requestId);

    if (donationRequest && new Date(donationRequest.deadline) < new Date()) {
      await DonationRequest.findByIdAndDelete(requestId);
      console.log(`Donation request ${requestId} deleted as deadline has passed.`);
    }
  } catch (error) {
    console.error("Error deleting donation request:", error.message);
  }
};

const getDonorsByDonationRequest = async (req, res) => {
    try {
      const { donationRequestId } = req.params;
      const donations = await Donation.find({ donationRequest: donationRequestId }).populate('donor');
      
      if (!donations.length) {
        return res.status(404).json({ message: 'No donors found for this donation request' });
      }

      const donorsWithDetails = donations.map(donation => ({
        id: donation.donor._id,
        name: donation.donor.name,
        avatar: donation.donor.avatar || '',
        amount: donation.amountDonated,
        date: donation.timestamp || donation.date
      }));
      
      res.status(200).json({ success: true, donors: donorsWithDetails });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
module.exports = { 
  createDonationRequest,
  approveOrRejectDonationRequest,
  getAllDonationRequests,
deleteDonationRequestIfDeadlinePassed,
  createDonationPayment,
  confirmDonation,
  getDonorsByDonationRequest
  
};
