import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import {
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  UploadFile as UploadIcon,
} from "@mui/icons-material";
import { FileText } from "lucide-react";
import { toast } from "react-toastify";

Modal.setAppElement("#root");

const JobApplicationModal = ({ isOpen, onClose, jobData, userData }) => {
  const [formData, setFormData] = useState({
    resume: null,
    coverLetter: null,
  });

  const [loading, setLoading] = useState(false);
  const [resumeError, setResumeError] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  useEffect(() => {
    setFormData({ resume: null, coverLetter: null });
    setResumeError(false);
    setCoverLetterError(false);
    setSubmissionError(null);
  }, [isOpen]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file && file.type === "application/pdf") {
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      if (name === "resume") {
        setResumeError(false);
      } else if (name === "coverLetter") {
        setCoverLetterError(false);
      }
    } else {
      alert("Please upload a valid PDF file");
    }
  };

  const handleRemoveFile = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: null,
    }));

    if (name === "resume") setResumeError(true);
    if (name === "coverLetter") setCoverLetterError(true);
  };
// console.log(jobData?._id,userData?._id);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.resume) setResumeError(true);
    if (!formData.coverLetter) setCoverLetterError(true);

    if (!formData.resume || !formData.coverLetter) return;

    setLoading(true);
    setSubmissionError(null);

    try {
      const submitData = new FormData();
      submitData.append("jobId", jobData?._id);
      submitData.append("applicantId", userData._id); 
      submitData.append("resume", formData.resume);
      submitData.append("coverLetter", formData.coverLetter);

      const response = await fetch("https://alumlink-ruo3.onrender.com/api/v1/application/apply", {
        method: "POST",
        body: submitData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to apply for the job.");
      }

      toast.success("Application submitted successfully!");
      onClose();
    } catch (error) {
      setSubmissionError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Job Application"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-hidden"
    >
      <IconButton
        onClick={onClose}
        style={{ position: "absolute", top: "10px", right: "10px" }}
      >
        <CloseIcon />
      </IconButton>

      <Box display="flex" flexDirection="column" maxHeight="80vh" overflow="auto" padding={2}>
        <Typography variant="h5" style={{ marginBottom: "16px", paddingBottom: "16px" }}>
          Job Application
        </Typography>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Typography variant="body1" color="textSecondary">
            Applying as <strong>{userData?.name}</strong> ({userData?.email})
          </Typography>

          <Box>
            <Button variant="contained" component="label" fullWidth startIcon={<UploadIcon />}>
              Upload Resume (PDF)
              <input type="file" name="resume" accept="application/pdf" onChange={handleFileChange} hidden />
            </Button>
            {formData.resume && (
              <Chip
                label={formData.resume.name}
                onDelete={() => handleRemoveFile("resume")}
                color="success"
                variant="outlined"
                icon={<FileText />}
                className="mt-4"
                style={{ marginTop: "8px" }}
              />
            )}
            {resumeError && <Typography color="error">Resume is required.</Typography>}
          </Box>

          <Box>
            <Button variant="contained" component="label" fullWidth startIcon={<UploadIcon />}>
              Upload Cover Letter (PDF)
              <input type="file" name="coverLetter" accept="application/pdf" onChange={handleFileChange} hidden />
            </Button>
            {formData.coverLetter && (
              <Chip
                label={formData.coverLetter.name}
                onDelete={() => handleRemoveFile("coverLetter")}
                color="success"
                variant="outlined"
                icon={<FileText />}
                style={{ marginTop: "8px" }}
                className="mt-2"
              />
            )}
            {coverLetterError && <Typography color="error">Cover Letter is required.</Typography>}
          </Box>

          {submissionError && <Typography color="error">{submissionError}</Typography>}

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose} variant="outlined" color="warning">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Submit Application"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default JobApplicationModal;
