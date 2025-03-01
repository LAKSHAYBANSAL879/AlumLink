const Application = require("../models/application");
const Job = require("../models/job");
const  jobController  = require("./jobController");
// ✅ APPLY for a Job
const applyForJob = async (req, res) => {
    try {
      const { jobId, applicantId } = req.body;
  
      if (!jobId || !applicantId) {
        return res.status(400).json({ message: "jobId and applicantId are required" });
      }
  
      if (!req.files || !req.files.resume) {
        return res.status(400).json({ message: "Resume file is required" });
      }
  
      const resumePath = req.files.resume[0].path;
      const coverLetterPath = req.files.coverLetter ? req.files.coverLetter[0].path : null;
  
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });
  
      const newApplication = new Application({
        job: jobId,
        applicant: applicantId,
        resume: resumePath,
        coverLetter: coverLetterPath,
      });
  
      await newApplication.save();
  
      job.applicants.push(applicantId);
      await job.save();
  
      await jobController.deleteJobIfFull(jobId);
  
      res.status(201).json({
        message: "Applied successfully",
        application: newApplication,
      });
    } catch (error) {
      res.status(500).json({ message: "Error applying for job", error: error.message });
    }
  };
// ✅ UPDATE Application Status (Admin or Employer can update)
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    const validStatuses = ["Applied", "Shortlisted", "Rejected", "Hired"];

    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    application.status = status;
    await application.save();

    res.status(200).json({ message: "Application status updated", application });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};
const getUserAppliedJobs = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Find all jobs where the user is in the applicants list
    const applications = await Application.find({ applicant: userId }).populate("job");

    res.status(200).json({
      success: true,
      appliedJobs: applications,
    });
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params; 

    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID is required" });
    }

    
    const applications = await Application.find({ job: jobId })
      .populate("applicant")
      .populate("job");

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Error fetching applications for job:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
const getApplicationsByEmployer = async (req, res) => {
  try {
    
      const {userId} = req.body;
      if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required"
        });
    }

      const employerJobs = await Job.find({ postedBy: userId });
      const jobIds = employerJobs.map(job => job._id);

      
      const applications = await Application.find({
          job: { $in: jobIds },
          status: { $in: ["Applied", "Shortlisted"] }
      })
      .populate("job")
      .populate("applicant")

      res.status(200).json({
          success: true,
          count: applications.length,
          data: applications
      });

  } catch (error) {
      res.status(500).json({
          success: false,
          message: "Error fetching applications",
          error: error.message
      });
  }
};
module.exports = {
     updateApplicationStatus,
      applyForJob,
      getUserAppliedJobs,
      getApplicationsForJob,
      getApplicationsByEmployer
}