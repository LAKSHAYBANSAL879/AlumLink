import React, { useContext, useEffect, useState } from 'react';
import { Card } from '@mui/material';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Bar, ResponsiveContainer } from 'recharts';
import { User, Briefcase, FileCheck, Clock } from 'lucide-react';
import { UserContext } from '../../userContext';
import JobPostingModal from './JobPostingModal';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const HrDashboard = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const [recentJobs, setRecentJobs] = useState([]);
  const [allPostedJobs, setAllPostedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [appliedCount, setAppliedCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [applicationTrends, setApplicationTrends] = useState([]);
  const userId = user?._id;
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/v1/application/getApplicationEmployer',
        { userId },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setApplications(response.data.data);
    } catch (err) {
      console.log(err.message);
    }
  };

  const countApplicationStatuses = () => {
    let applied = 0;
    let shortlisted = 0;

    applications.forEach((app) => {
      if (app.status === 'Applied') {
        applied++;
      } else if (app.status === 'Shortlisted') {
        shortlisted++;
      }
    });

    setAppliedCount(applied);
    setShortlistedCount(shortlisted);
  };

  useEffect(() => {
    countApplicationStatuses();
    generateApplicationTrends();
  }, [applications]);

  const handleJobPost = (jobData) => {
    console.log("Job Posted Successfully:", jobData);
  };

  const generateApplicationTrends = () => {
    let trends = {};

    applications.forEach((app) => {
      const month = new Date(app.appliedAt).toLocaleString('en-US', { month: 'short' });

      if (!trends[month]) {
        trends[month] = { month, applications: 0, interviews: 0, offers: 0 };
      }

      trends[month].applications += 1;

      if (app.status === 'Shortlisted') {
        trends[month].interviews += 1;
      } else if (app.status === 'Selected') {
        trends[month].offers += 1;
      }
    });

    const sortedTrends = Object.values(trends).sort((a, b) => 
      new Date(`01 ${a.month} 2024`) - new Date(`01 ${b.month} 2024`)
    );

    setApplicationTrends(sortedTrends);
  };

  const getTotalApplicants = () => {
    return allPostedJobs.reduce((total, job) => total + (job.applicants?.length || 0), 0);
  };

  useEffect(() => {
    const fetchPostedJobs = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/jobs/getPostedJobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?._id }),
        });
        const data = await response.json();
        if (data.success) {
          setAllPostedJobs(data.postedJobs);
          const sortedJobs = data.postedJobs
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          setRecentJobs(sortedJobs);
        }
      } catch (error) {
        console.error('Error fetching posted jobs:', error);
      }
    };

    if (user?._id) {
      fetchPostedJobs();
    }
  }, [user]);

  const handleJobClick = (jobId) => {
    navigate(`/job-applications/${jobId}`);
  };

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
    .slice(0, 5);

  const getJobCategoryCounts = () => {
    const categories = {
      Development: 0,
      Design: 0,
      Marketing: 0,
      Management: 0,
    };

    allPostedJobs.forEach((job) => {
      if (job.category in categories) {
        categories[job.category]++;
      }
    });

    return Object.keys(categories).map((category) => ({
      category,
      count: categories[category],
    }));
  };

  return (
    <div className="p-6 space-y-6 min-h-screen ">
      <div className="flex justify-between items-center">
        <div className='flex flex-col text-left '>
          <h1 className="text-2xl font-bold text-gray-800">Job Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your recruitment process and applications</p>
        </div>
        <div>
          {user ? (
            <button 
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-colors duration-200 font-medium shadow-sm"
              onClick={() => setModalOpen(true)}
            >
              Post New Job
            </button>
          ) : (
            <Link to='/login'>
              <button className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Login first to post a job
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Jobs</p>
              <p className="text-2xl font-semibold">{allPostedJobs?.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-full">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Applicants</p>
              <p className="text-2xl font-semibold">{getTotalApplicants()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-50 rounded-full">
              <FileCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Interviews</p>
              <p className="text-2xl font-semibold">{shortlistedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Review</p>
              <p className="text-2xl font-semibold">{appliedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Application Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={applicationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="interviews" stroke="#7c3aed" strokeWidth={2} />
              <Line type="monotone" dataKey="offers" stroke="#059669" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Jobs by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getJobCategoryCounts()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Recent Job Postings</h2>
          <div className="flex justify-between items-center font-medium border-b pb-2 text-gray-700">
            <div className="flex-1 px-4">Title</div>
            <div className="flex-1 px-4">Applicants</div>
            <div className="flex-1 px-4">Company</div>
            <div className="flex-1 px-4">Posted At</div>
          </div>
          <div className="mt-2">
            {recentJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No jobs posted yet.</p>
            ) : (
              recentJobs.map((job) => (
                <div
                  key={job._id}
                  className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                  onClick={() => handleJobClick(job._id)}
                >
                  <div className="flex-1 px-4 font-medium text-gray-800">{job?.title}</div>
                  <div className="flex-1 px-4 text-gray-600">{job?.applicants.length}</div>
                  <div className="flex-1 px-4 text-gray-700">{job?.company || "Unknown Company"}</div>
                  <div className="flex-1 px-4 text-gray-500 text-sm">
                    {new Date(job?.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Recent Applications</h2>
          <div className="flex justify-between items-center font-medium border-b pb-2 text-gray-700">
            <div className="flex-1 px-4">Name</div>
            <div className="flex-1 px-4">Position</div>
            <div className="flex-1 px-4">Company</div>
            <div className="flex-1 px-4">Applied At</div>
          </div>
          <div className="mt-2">
            {recentApplications.map(application => (
              <div
                key={application._id}
                className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <div className="flex-1 px-4 font-medium text-gray-800">
                  {application?.applicant?.name}
                </div>
                <div className="flex-1 px-4 text-gray-600">{application?.job?.title}</div>
                <div className="flex-1 px-4 text-gray-700">
                  {application?.job?.company}
                </div>
                <div className="flex-1 px-4 text-gray-500 text-sm">
                  {new Date(application?.appliedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <JobPostingModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleJobPost}
        loggedInUser={user}
      />
    </div>
  );
};

export default HrDashboard;