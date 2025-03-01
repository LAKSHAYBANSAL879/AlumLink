import React, { useState } from "react";
import Modal from "react-modal";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

const ResumeScoreModal = ({ isOpen, onClose, job }) => {
  const [resume, setResume] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    setResume(file);
    // Reset states when new file is uploaded
    setMatchScore(null);
    setSkills([]);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!resume) {
      alert("Please upload a resume.");
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("resume", resume);
    
    const lowercaseSkills = job?.skillsRequired?.map(skill => skill.toLowerCase()) || [];
    formData.append("job_skills", lowercaseSkills.join(','));

    try {
      const response = await fetch("http://127.0.0.1:5001/match_resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error processing resume");

      const data = await response.json();
      setMatchScore(data.skills_match_score || 0);
      // Convert matched skills to lowercase when storing
      setSkills((data.matched_skills || []).map(skill => skill.toLowerCase()));
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to process resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const matchedSkills = skills || [];
  const requiredSkills = job?.skillsRequired || [];
  // Convert required skills to lowercase for comparison
  const missingSkills = requiredSkills.filter(skill => 
    !matchedSkills.includes(skill.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="relative w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Check Resume Match</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-600">
                    {resume ? resume.name : "Upload your resume (PDF)"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !resume}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <span className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Analyze Resume
                </span>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Results Section */}
          {matchScore !== null && !error && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Match Score</h3>
                  <span className={`text-2xl font-bold ${
                    matchScore >= 70 ? 'text-green-600' : 
                    matchScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {matchScore}%
                  </span>
                </div>

                <div className="space-y-4">
                  {matchedSkills.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-700">Matched Skills</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* Display original case from required skills for matched skills */}
                        {requiredSkills
                          .filter(skill => matchedSkills.includes(skill.toLowerCase()))
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {skill}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {missingSkills.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-700">Missing Skills</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {missingSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ResumeScoreModal;