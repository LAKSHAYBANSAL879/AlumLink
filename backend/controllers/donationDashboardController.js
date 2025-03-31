const Donation = require("../models/donation");
const DonationRequest = require("../models/donationRequest");
const User = require("../models/User");

// 🏆 Get Top Donors (Sorted by total donation amount)
const getTopDonors = async (req, res) => {
  try {
    const topDonors = await Donation.aggregate([
    { $group: { _id: "$donor", totalDonated: { $sum: "$amountDonated" } } },
      { $sort: { totalDonated: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "donorInfo"
        }
      },
      { $unwind: "$donorInfo" },
      { $project: { _id: 0, donor: "$donorInfo.name", totalDonated: 1 } }
    ]);

    res.json({ topDonors });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Get All Donation Requests Created by User
const getMyDonationRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const myRequests = await DonationRequest.find({ createdBy: userId  });
    res.json(myRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 💰 Get All Donations Done by User
const getMyDonations = async (req, res) => {
  try {
    const { userId } = req.params;
    const myDonations = await Donation.find({ donor: userId }).populate({
        path: "donationRequest",
        populate: { path: "createdBy", select: "name email" } 
    });
    res.json( myDonations );
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


const getAllDonations = async (req, res) => {
  try {
    const donationRequests = await Donation.find();
    res.json(donationRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getTopDonors,
  getMyDonationRequests,
  getMyDonations,
  getAllDonations
};
