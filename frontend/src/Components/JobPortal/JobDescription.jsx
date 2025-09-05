import React, { useContext, useEffect, useState } from 'react';
import { BriefcaseBusiness, Clock, MapPin, ReceiptIndianRupee, Bookmark, BookmarkPlus, ArrowRight, Building } from 'lucide-react';
import { UserContext } from '../../userContext';
import JobApplicationModal from './JobApplicationModal';
import { useNavigate, useParams } from 'react-router-dom';
import ResumeScoreModal from './ResumeScoreModal';

const JobDescription = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [allJobs, setAllJobs] = useState([]);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [limit,setLimit]=useState(false);

  const { user } = useContext(UserContext);
  const userId=user?._id;
  const currDate=new Date();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/jobs/${jobId}`);
        if (!response.ok) throw new Error('Failed to fetch job details');
        const data = await response.json();
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
      }
    };

    const checkIfJobSaved = async () => {
      if (!userId) return;
      try {
        const response = await fetch('http://localhost:8080/api/v1/auth/getSavedJobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        if (!response.ok) throw new Error('Failed to fetch saved jobs');
        const data = await response.json();
        setIsBookmarked(data.savedJobs.some(savedJob => savedJob._id === jobId));
      } catch (error) {
        console.error('Error checking saved jobs:', error);
      }
    };
    const fetchAllJobs = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/jobs/all'); // Fetch all jobs
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const data = await response.json();
        setAllJobs(data);
      } catch (error) {
        console.error('Error fetching all jobs:', error);
      }
    };
    fetchAllJobs();
    fetchJobDetails();
    checkIfJobSaved();
  }, [jobId, userId]);

  useEffect(() => {
    if (job && allJobs.length > 0) {
      const filteredJobs = allJobs.filter(
        (j) => j.category === job.category && j._id !== job._id
      );
      setSimilarJobs(filteredJobs);
    }
  }, [job, allJobs]);
// console.log("similar jobs are :",similarJobs)
const handleApply = () => {
  setIsApplyModalOpen(true);
};

const handleCheckScore = () => {
  setIsScoreModalOpen(true);
};

  const toggleSaveJob = async () => {
    if (!user) return alert('Please log in to save jobs');

    const url = isBookmarked 
      ? 'http://localhost:8080/api/v1/auth/unsaveJob' 
      : 'http://localhost:8080/api/v1/auth/saveJob';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, jobId: job._id }),
      });

      if (!response.ok) throw new Error(`Failed to ${isBookmarked ? 'unsave' : 'save'} job`);
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error saving/un-saving job:', error);
    }
  };

  const timeAgo = (postedDate) => {
    if (!postedDate) return "Unknown";
    const postedTime = new Date(postedDate);
    const now = new Date();
    const diffMs = now - postedTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const navigate=useNavigate();
  const handleJobClick = (job) => {
navigate(`/jobDesc/${job?._id}`)
  };

  useEffect(() => {
    const checkUserApplication = async () => {
      if (!userId) return;
  
      try {
        const response = await fetch('http://localhost:8080/api/v1/jobs/checkUserApplied', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId, userId }),
        });
  
        if (!response.ok) throw new Error('Failed to check application status');
        const data = await response.json();
        setHasApplied(data.hasApplied);
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };
  
    checkUserApplication();
    checkExpired();
  }, [jobId, userId]);
  const checkExpired=()=>{
    if(new Date(job.applicationDeadline)>=currDate){
      setLimit(true);
    }
  }
  return (
    <div className="w-full md:w-5/6 mx-auto p-6 bg-white rounded-md flex md:flex-row flex-col gap-4">
      <div className="flex flex-col w-full md:w-2/3 shadow-lg p-4 align-middle justify-start">
        <div className="flex flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{job?.title}</h1>
          <button
            onClick={toggleSaveJob}
            className={`top-2 right-2 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors ${isBookmarked ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <BookmarkPlus className="w-6 h-6" />
          </button>
        </div>
  <div className="flex flex-col md:flex-row justify-center items-center md:justify-start md:items-start gap-4 p-4 border rounded-xl shadow-sm">
  {/* Company Logo */}
  <div className="flex-shrink-0">
    <img
      src={job?.companyImageUrl}
      alt={`${job?.company} logo`}
      className="w-24 h-24 text-center md:text-left md:w-24 md:h-24 object-contain rounded"
    />
  </div>

  {/* Job Info */}
  <div className="flex flex-col gap-3 w-full">
    {/* Company + Posted Time + Deadline */}
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
      <h1 className="text-gray-700 font-semibold text-lg font-mono">
        {job?.company}
      </h1>
      <h1 className="flex items-center gap-1 text-gray-600 text-sm">
        <Clock className="w-4 h-4" />
        {timeAgo(job?.createdAt)}
      </h1>
      <h1 className="flex items-center gap-2 text-gray-600 text-sm">
        <span className="font-medium">Apply by</span>{" "}
        {formatDate(job?.applicationDeadline)}
      </h1>
    </div>

    {/* Experience + Salary */}
    <div className="flex flex-col md:flex-row gap-3">
      <h1 className="flex items-center gap-2 text-gray-600 text-sm">
        <BriefcaseBusiness className="w-5 h-5" />
        <span>{job?.experienceLevel}</span>
      </h1>
      <h1 className="flex items-center gap-2 text-gray-600 text-sm">
        <ReceiptIndianRupee className="w-5 h-5" />
        <span>{job?.salaryRange}</span>
      </h1>
    </div>

    {/* Location + Apply Button */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 w-full">
      <h1 className="flex items-center gap-2 text-gray-600 text-sm">
        <MapPin className="w-5 h-5" />
        <span>{job?.location?.join(", ")}</span>
      </h1>

      <button
        onClick={handleApply}
        disabled={hasApplied || limit}
        className={`px-6 py-2 rounded-2xl text-sm font-medium transition ${
          hasApplied || limit
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-green-500 hover:bg-green-400 text-white"
        } w-full sm:w-auto`}
      >
        {hasApplied ? "Already Applied or Job Expired" : "Apply"}
      </button>
    </div>
  </div>
</div>


        <div className="w-full mx-auto mt-3 mb-2 roundex-3xl border-b-2 border-gray-500 border-dashed pb-4">
          <h1 className="py-1 w-3/4 mx-auto text-gray-600 font-normal bg-blue-200 rounded-2xl">
            Total applicants: {job?.applicants?.length || 0}
          </h1>
        </div>

        <div className="mb-3 text-left mt-2 border-b-2 border-gray-500 border-dashed pb-4">
          <h2 className="text-lg text-gray-700 font-medium mb-2">Key Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            {job?.description?.split('.').map((line, index) => (
              line.trim() && <li key={index}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col text-left align-middle justify-start border-b-2 border-gray-500 border-dashed pb-4">
          <h2 className="text-lg text-gray-700 font-medium mb-2">Skills required</h2>
          <div className="flex gap-2 flex-wrap">
           
            {job?.skillsRequired?.length > 0 ? (
              job.skillsRequired.map((skill, index) => (
                <span key={index} className="bg-blue-200 rounded-3xl text-gray-600 px-6 py-1 font-normal text-base">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-500">No skills listed</span>
            )}
             <button onClick={handleCheckScore}className='bg-gray-200 py-1 px-4 rounded-2xl' >Check Skill Score</button>
          </div>
        </div>

        <div className="flex flex-col text-left justify-start border-b-2 border-gray-500 border-dashed pb-4 pt-4">
          <h1 className="text-lg text-gray-700 font-medium mb-2">About {job?.company}</h1>
          <p className="text-gray-600 text-base font-light">{job?.about}</p>
        </div>

        <div className="flex flex-col text-left justify-start pt-3">
          <h1 className="text-lg text-gray-700 font-medium mb-2">Posted By</h1>
          <p className="text-gray-600 text-base font-light">
            {job?.postedBy?.name} <span className='text-gray-500 text-small'>({job?.postedBy?.position})</span>
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/3 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Similar Jobs</h2>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        {similarJobs.length>0 ? (
 similarJobs.map((job, index) => (
  <div 
    key={index}
    className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200"
  >
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600">
          {job.title}
        </h3>
        
        <div className="flex items-center text-gray-600">
          <Building className="w-4 h-4 mr-2" />
          <span className="text-sm">{job.company}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">{job.location.join(',')}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <ReceiptIndianRupee className="w-4 h-4 mr-2" />
          <span className="text-sm">{job.salaryRange}</span>
        </div>
      </div>

      <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group" onClick={()=>handleJobClick(job)}>
        View Job
        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  </div>
))
        ):(
<h1>No similar jobs found</h1>
        )}
       
      </div>
    </div>
    <JobApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        jobData={job}
        userData={user}
      />
      <ResumeScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        job={job}
        userData={user}
      />
    </div>
  );
};

export default JobDescription;