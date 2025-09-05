import React, { useState, useEffect } from 'react';
import { Download, ChevronDown, FileText } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const JobApplicantsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [updateLoading, setUpdateLoading] = useState(null);
  const [matchResult, setMatchResult] = useState({});
  const [checkingResume, setCheckingResume] = useState(null);
  const { jobId } = useParams();

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/application/getApplications/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications);
        // data.applications.forEach((application) => {
        //   if (application.resume) {
        //     handleCheckResume(application.resume, application.job, application._id, true);
        //   }
        // });
      } else {
        setError('Failed to fetch applications');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, newStatus) => {
    setUpdateLoading(applicationId);
    try {
      const response = await fetch('http://localhost:8080/api/v1/application/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setApplications(applications.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating application status');
    } finally {
      setUpdateLoading(null);
    }
  };

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return null;
    
   
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    
    
    const baseFilename = fileUrl.includes('uploads/resumes/') 
      ? fileUrl.replace('uploads/resumes/', '') 
      : fileUrl;
      
    return `http://localhost:8080/api/v1/application/${baseFilename}`;
  };

  const handleFileDownload = (fileUrl) => {
    if (!fileUrl) return;
    
  const finalUrl = getFileUrl(fileUrl);
    // if (finalUrl.startsWith('https://')) {
      window.open(finalUrl, '_blank');
      return;
    // }
    
  //  else{
  //   const baseFilename = finalUrl.replace('uploads/resumes/', '');
  //   window.open(`http://localhost:8080/api/v1/application/${baseFilename}`, '_blank');
  //  }
  };

  const handleCheckResume = async (resumeFilename, job, applicationId,isAuto=false) => {
    if (!resumeFilename) {
      toast.error('No resume available');
      return;
    }

    setCheckingResume(applicationId);
    try {
     
      const resumeResponse = await fetch(`http://localhost:8080/api/v1/application/${resumeFilename}`);
      if (!resumeResponse.ok) throw new Error('Failed to fetch resume');

      const blob = await resumeResponse.blob();
      const file = new File([blob], resumeFilename, { type: 'application/pdf' });

      
      const formData = new FormData();
      formData.append('resume', file);
      const lowercaseSkills = job?.skillsRequired?.map(skill => skill.toLowerCase()) || [];
      formData.append("job_skills", lowercaseSkills.join(','));

      const flaskResponse = await fetch('https://alumlinkpythoncode.onrender.com/check_resume', {
        method: 'POST',
        body: formData,
      });

      const data = await flaskResponse.json();

      if (flaskResponse.ok) {
        setMatchResult({
          ...matchResult,
          [applicationId]: {
            skillsMatchScore: data.skills_match_score,
            matchedSkills: data.matched_skills,
            experienceMonths: data.experience_months,
            experienceYears: data.experience_years,
          }
        });
      } else {
        throw new Error(data.error || 'Failed to match resume');
      }
    } catch (err) {
      if (!isAuto) alert('Error checking resume');
      console.error('Error checking resume:', err);
      toast.error(err.message || 'Error checking resume');
    } finally {
      setCheckingResume(null);
    }
  };

  const filteredApplications = [...applications]
  .filter(app => selectedStatus === 'All' || app.status === selectedStatus)
  .sort((a, b) => (matchResult[b._id]?.skillsMatchScore || 0) - (matchResult[a._id]?.skillsMatchScore || 0));

  const statusColors = {
    Applied: 'bg-blue-100 text-blue-800',
    Shortlisted: 'bg-yellow-100 text-yellow-800',
    Rejected: 'bg-red-100 text-red-800',
    Hired: 'bg-green-100 text-green-800'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Applicants</h1>
        <select
          className="p-2 border rounded-lg"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Applied">Applied</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Rejected">Rejected</option>
          <option value="Hired">Hired</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow">
        {filteredApplications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No applications found
          </div>
        ) : (
          <div>
          <div className='hidden md:block'>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Applicant</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Applied Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Documents</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Resume Analysis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{application.applicant.name}</div>
                      <div className="text-sm text-gray-500">{application.applicant.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${statusColors[application.status]}`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleFileDownload(application.resume, 'resume')}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Resume
                        </button>
                        {application.coverLetter && (
                          <button
                            onClick={() => handleFileDownload(application.coverLetter, 'coverLetter')}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Cover Letter
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 flex flex-col justify-left text-left">
                      <div className="relative inline-block">
                        <select
                          className={`p-2 border rounded appearance-none pr-8 bg-white ${
                            updateLoading === application._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          value={application.status}
                          onChange={(e) => updateStatus(application._id, e.target.value)}
                          disabled={updateLoading === application._id}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Hired">Hired</option>
                        </select>
                        {updateLoading === application._id ? (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {checkingResume === application._id ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Analyzing...
                        </div>
                      ) : matchResult[application._id] ? (
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Skills Match:</span> {matchResult[application._id].skillsMatchScore}%
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Experience:</span> {matchResult[application._id].experienceYears} years
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Matched Skills:</span> {matchResult[application._id].matchedSkills.join(', ')}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCheckResume(application.resume, application.job, application._id)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Analyze Resume
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>

             <div className='md:hidden block'>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Applicant</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
        
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{application.applicant.name}</div>
                      <div className="text-sm text-gray-500">{application.applicant.email}</div>
                      <div className='px-6 py-4 text-sm'>{new Date(application.appliedAt).toLocaleDateString()}</div>
                      <div><span className={`px-3 py-1 rounded-full text-sm ${statusColors[application.status]}`}> {application.status}
                      </span></div>
                        <div >
                           <div className="flex gap-4">
                        <button
                          onClick={() => handleFileDownload(application.resume, 'resume')}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Resume
                        </button>
                        {application.coverLetter && (
                          <button
                            onClick={() => handleFileDownload(application.coverLetter, 'coverLetter')}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Cover
                          </button>
                        )}
                      </div>
                        </div>
                    </td>
                   
                    <td className="px-6 py-4 flex flex-col">
                      <div className="relative inline-block">
                        <select
                          className={`p-2 border rounded appearance-none pr-8 bg-white ${
                            updateLoading === application._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          value={application.status}
                          onChange={(e) => updateStatus(application._id, e.target.value)}
                          disabled={updateLoading === application._id}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Hired">Hired</option>
                        </select>
                        {updateLoading === application._id ? (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
                        )}
                      </div>
                      <div>
                         {checkingResume === application._id ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Analyzing...
                        </div>
                      ) : matchResult[application._id] ? (
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Skills Match:</span> {matchResult[application._id].skillsMatchScore}%
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Experience:</span> {matchResult[application._id].experienceYears} years
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Matched Skills:</span> {matchResult[application._id].matchedSkills.join(', ')}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCheckResume(application.resume, application.job, application._id)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Analyze Resume
                        </button>
                      )}
                      </div>
                    </td>
                  
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicantsPage;