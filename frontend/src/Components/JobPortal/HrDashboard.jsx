import React, { useContext, useEffect, useState } from 'react';
import { Card } from '@mui/material';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Bar, ResponsiveContainer } from 'recharts';
import { User, Briefcase, FileCheck, Clock, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userId = user?._id;
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.post('https://alumlink-ruo3.onrender.com/api/v1/application/getApplicationEmployer',
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
        const response = await fetch('https://alumlink-ruo3.onrender.com/api/v1/jobs/getPostedJobs', {
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className='flex flex-col text-left'>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Job Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor your recruitment process and applications</p>
        </div>
        <div className="flex justify-end">
          {user ? (
            <button 
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-colors duration-200 font-medium shadow-sm text-sm sm:text-base w-full sm:w-auto"
              onClick={() => setModalOpen(true)}
            >
              Post New Job
            </button>
          ) : (
            <Link to='/login' className="w-full sm:w-auto">
              <button className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 
                               text-sm sm:text-base w-full">
                Login first to post a job
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="p-3 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-blue-50 rounded-full">
              <Briefcase className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Active Jobs</p>
              <p className="text-lg sm:text-2xl font-semibold">{allPostedJobs?.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-green-50 rounded-full">
              <User className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Applicants</p>
              <p className="text-lg sm:text-2xl font-semibold">{getTotalApplicants()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-purple-50 rounded-full">
              <FileCheck className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Interviews</p>
              <p className="text-lg sm:text-2xl font-semibold">{shortlistedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-yellow-50 rounded-full">
              <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Pending Review</p>
              <p className="text-lg sm:text-2xl font-semibold">{appliedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">Application Trends</h2>
          <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
            <LineChart data={applicationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="interviews" stroke="#7c3aed" strokeWidth={2} />
              <Line type="monotone" dataKey="offers" stroke="#059669" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">Jobs by Category</h2>
          <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
            <BarChart data={getJobCategoryCounts()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Job Postings */}
        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">Recent Job Postings</h2>
          
          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="flex justify-between items-center font-medium border-b pb-2 text-gray-700 text-sm">
              <div className="flex-1 px-2">Title</div>
              <div className="flex-1 px-2">Applicants</div>
              <div className="flex-1 px-2">Company</div>
              <div className="flex-1 px-2">Posted At</div>
            </div>
            <div className="mt-2">
              {recentJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">No jobs posted yet.</p>
              ) : (
                recentJobs.map((job) => (
                  <div
                    key={job._id}
                    className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                    onClick={() => handleJobClick(job._id)}
                  >
                    <div className="flex-1 px-2 font-medium text-gray-800 text-sm truncate">{job?.title}</div>
                    <div className="flex-1 px-2 text-gray-600 text-sm">{job?.applicants.length}</div>
                    <div className="flex-1 px-2 text-gray-700 text-sm truncate">{job?.company || "Unknown Company"}</div>
                    <div className="flex-1 px-2 text-gray-500 text-xs">
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
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden space-y-3">
            {recentJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">No jobs posted yet.</p>
            ) : (
              recentJobs.map((job) => (
                <div
                  key={job._id}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleJobClick(job._id)}
                >
                  <div className="font-medium text-gray-800 text-sm mb-2">{job?.title}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div><span className="font-medium">Applicants:</span> {job?.applicants.length}</div>
                    <div><span className="font-medium">Company:</span> {job?.company || "Unknown"}</div>
                    <div className="col-span-2">
                      <span className="font-medium">Posted:</span> {new Date(job?.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Applications */}
        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">Recent Applications</h2>
          
          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="flex justify-between items-center font-medium border-b pb-2 text-gray-700 text-sm">
              <div className="flex-1 px-2">Name</div>
              <div className="flex-1 px-2">Position</div>
              <div className="flex-1 px-2">Company</div>
              <div className="flex-1 px-2">Applied At</div>
            </div>
            <div className="mt-2">
              {recentApplications.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">No applications yet.</p>
              ) : (
                recentApplications.map(application => (
                  <div
                    key={application._id}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex-1 px-2 font-medium text-gray-800 text-sm truncate">
                      {application?.applicant?.name}
                    </div>
                    <div className="flex-1 px-2 text-gray-600 text-sm truncate">{application?.job?.title}</div>
                    <div className="flex-1 px-2 text-gray-700 text-sm truncate">
                      {application?.job?.company}
                    </div>
                    <div className="flex-1 px-2 text-gray-500 text-xs">
                      {new Date(application?.appliedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden space-y-3">
            {recentApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">No applications yet.</p>
            ) : (
              recentApplications.map(application => (
                <div
                  key={application._id}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="font-medium text-gray-800 text-sm mb-2">
                    {application?.applicant?.name}
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                    <div><span className="font-medium">Position:</span> {application?.job?.title}</div>
                    <div><span className="font-medium">Company:</span> {application?.job?.company}</div>
                    <div>
                      <span className="font-medium">Applied:</span> {new Date(application?.appliedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <JobPostingModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        loggedInUser={user}
      />
    </div>
  );
};

export default HrDashboard;