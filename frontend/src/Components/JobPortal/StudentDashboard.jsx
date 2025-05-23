import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Tab, Tabs, Typography,Box,Grid } from '@mui/material';
import { LineChart, DoughnutChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer, Bar } from 'recharts';
import { Calendar, Mail, Award, Clock, Search, CheckCircle, XCircle, AlertCircle, Target, BarChart, TrendingUp, Bookmark, Building, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../userContext';
import axios from 'axios';
import ResumeScoreModal from './ResumeScoreModal';


const StudentDashboard = () => {
  // Sample data for the application timeline
  const [savedJobs,setSavedJobs]=useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
    const [selected, setSelectedCount] = useState(0);
    const [shortlistedCount, setShortlistedCount] = useState(0);
    const [upcomingInterviews, setUpcomingInterviews] = useState([]);
    const [applicationTrends,setApplicationTrends]=useState([]);
     const [jobsData, setJobsData] = useState([]);
     const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
     const [selectedJob, setSelectedJob] = useState(null);
  const {user}=useContext(UserContext);
  const userId=user?._id;

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        if (!userId) return;
        
        const response = await axios.post('https://alumlink-ruo3.onrender.com/api/v1/application/getAppliedJobs', { userId });
        setAppliedJobs(response.data.appliedJobs);
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
        setError('Failed to fetch applied jobs.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, [userId]);

  console.log("applied jobs are",appliedJobs)
  const generateApplicationTrends = () => {
    let trends = {};
  
    appliedJobs.forEach((app) => {
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
  
    // Convert object to sorted array
    const sortedTrends = Object.values(trends).sort((a, b) => new Date(`01 ${a.month} 2024`) - new Date(`01 ${b.month} 2024`));
  
    setApplicationTrends(sortedTrends);
  };
  const handleCheckScore = (job) => {
    setIsScoreModalOpen(true);
    setSelectedJob(job);
  };
  const getRandomInterviewDate = () => {
    const today = new Date();
    const daysToAdd = Math.floor(Math.random() * 5) + 4;
    today.setDate(today.getDate() + daysToAdd);

    return today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

  const getRandomInterviewTime = () => {
    const hours = Math.floor(Math.random() * 9) + 10; 
    const minutes = Math.floor(Math.random() / 2) === 0 ? '00' : '30'; 
    return `${hours}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
  };


  const generateUpcomingInterviews = () => {
    const shortlistedInterviews = appliedJobs
      .filter(application => application?.status === 'Shortlisted')
      .map(application => ({
        id: application?.job?._id,
        company: application?.job.company,
        position: application?.job.title,
        date: getRandomInterviewDate(),
        time: getRandomInterviewTime(),
        type: 'Technical Round',
      }));

    setUpcomingInterviews(shortlistedInterviews);
  };


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('https://alumlink-ruo3.onrender.com/api/v1/jobs/all'); 
        setJobsData(response.data.slice(0,5));
       
      } catch (error) {
        console.error('Error fetching job data:', error);
      }
    };

    fetchJobs();
  }, []);

  const marketInsights = [
    {
      title: 'High Demand Skills',
      insights: ['React.js', 'TypeScript', 'AWS'],
      trend: 'Increasing demand in enterprise companies'
    },
    {
      title: 'Salary Trends',
      insights: ['10% increase in remote positions', 'Higher rates for cloud expertise'],
      trend: 'Average compensation up 7% from last quarter'
    },
    {
      title: 'Interview Focus Areas',
      insights: ['System Design', 'React Performance', 'AWS Services'],
      trend: 'More emphasis on practical implementation'
    }
  ];


  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ py: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };
  
  const fetchSavedJobs = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await fetch('https://alumlink-ruo3.onrender.com/api/v1/auth/getSavedJobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saved jobs');
      }

      const data = await response.json();
      // console.log("Fetched saved jobs:", data.savedJobs);

      setSavedJobs(data.savedJobs);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [userId]);
    const countApplicationStatuses = () => {
      let selected = 0;
      let shortlisted = 0;
  
      appliedJobs.forEach((app) => {
        if (app.status === 'Hired') {
          selected++;
        } else if (app.status === 'Shortlisted') {
          shortlisted++;
        }
      });
  
      setSelectedCount(selected);
      setShortlistedCount(shortlisted);
    };
    useEffect(() => {
      countApplicationStatuses();
      generateUpcomingInterviews();
      generateApplicationTrends();
     
    }, [appliedJobs]);
  console.log("applied jobs are",appliedJobs)

  // useEffect(() => {
  //   console.log('Updated savedJobs:', savedJobs);
  // }, [savedJobs]);
  // console.log("saved jobs are",savedJobs);
  const jobs = Array.isArray(savedJobs) ? savedJobs : [];
  // console.log(jobs)
  const navigate=useNavigate();
  const handleJobClick = (job) => {
navigate(`/jobDesc/${job._id}`)
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
  return (
    <div className="p-6 space-y-6  min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Job Search Dashboard</h1>
          <p className="text-gray-600">Track your job applications and interviews</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Applications</p>
            <p className="text-2xl font-semibold">{appliedJobs.length}</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Saved</p>
            <p className="text-2xl font-semibold">{savedJobs.length}</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Interviews</p>
            <p className="text-2xl font-semibold">{shortlistedCount}</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Award className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Offers</p>
            <p className="text-2xl font-semibold">{selected}</p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Application Timeline</h2>
          <LineChart width={600} height={300} data={applicationTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="applications" stroke="#2563eb" />
            <Line type="monotone" dataKey="offers" stroke="#7c3aed" />
            <Line type="monotone" dataKey="interviews" stroke="#059669" />
          </LineChart>
        </Card>

    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Job Search Analytics & Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: Today
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
          >
            <Tab label="Market Insights" />
            <Tab label="Best Matches" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {marketInsights.map((insight, index) => (
              <Card key={index} className="p-4 border">
                <h3 className="font-semibold text-lg mb-3">{insight.title}</h3>
                <ul className="space-y-2">
                  {insight.insights.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-gray-600">{insight.trend}</p>
              </Card>
            ))}
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
      <div className="space-y-4">
        {jobsData.map((job) => (
          <Card key={job?._id} className="p-5 border hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start align-left text-left">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-gray-600 text-sm flex gap-2 align-middle"><Building className='text-small'/> {job.company}</p>
                <div className="flex gap-2 text-sm text-gray-600">
                  <MapPin/>
                  <span> {job.location.join(',')}</span>
                  
                </div>
              </div>
              <div className="text-right">
                
                <button className="text-sm text-gray-900 bg-gray-100 px-4 py-1 mt-1" onClick={()=>handleCheckScore(job)}>Check Score</button>
              </div>
            </div>
            <button className="mt-4 text-blue-600 text-sm hover:text-blue-800 font-medium" onClick={()=>handleJobClick(job)}>
              View Job Details →
            </button>
       
          </Card>
      
        ))}
      </div>
    </TabPanel>

       
      </CardContent>
    </Card>
      </div>

      {/* Upcoming Interviews */}
      <Card className="p-6">
 <h2 className="text-lg font-semibold mb-4">Upcoming Interviews</h2>
 <div className="overflow-x-auto">
   <div className="w-full">
     {/* Headers */}
     <div className="flex items-center border-b bg-gray-100">
       <div className="flex-1  py-3 px-4 font-medium">Company</div>
       <div className="flex-1  py-3 px-4 font-medium">Position</div>
       <div className="flex-1  py-3 px-4 font-medium">Date</div>
       <div className="flex-1 py-3 px-4 font-medium">Time</div>
       <div className="flex-1  py-3 px-4 font-medium">Type</div>
     </div>

     {/* Interview Rows */}
     <div className="divide-y">
       {upcomingInterviews.map(interview => (
         <div key={interview.id} className="flex items-center hover:bg-gray-50">
           <div className="flex-1 py-3 px-4 font-medium">{interview.company}</div>
           <div className="flex-1 py-3 px-4">{interview.position}</div>
           <div className="flex-1 py-3 px-4">{interview.date}</div>
           <div className="flex-1 py-3 px-4">{interview.time}</div>
           <div className="flex-1 py-3 px-4">
             <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
               {interview.type}
             </span>
           </div>
         </div>
       ))}
     </div>
   </div>
 </div>
</Card>

      {/* Recent Applications */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Applications</h2>
        <div className="overflow-x-auto">
        <div className="w-full flex flex-col">
  {/* Header Row */}
  <div className="flex font-semibold border-b bg-gray-100 py-3 px-4">
    <div className="flex-1 text-center px-4">Company</div>
    <div className="flex-1 px-4">Position</div>
    <div className="flex-1 px-4">Applied Date</div>
    <div className="flex-1 px-4">Status</div>
    <div className="flex-1 px-4">Action</div>
  </div>

  {/* Content Rows */}
  {appliedJobs.map((application) => (
    <div
      key={application?.id}
      className="grid grid-cols-5 border-b py-3 px-4 hover:bg-gray-50 items-center"
    >
      <div className="font-medium">{application?.job?.company}</div>
      <div>{application?.job?.title}</div>
      <div>{formatDate(application?.appliedAt)}</div>
      <div>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            {
              Applied: "bg-yellow-100 text-yellow-800",
              Shortlisted: "bg-blue-100 text-blue-800",
              Rejected: "bg-red-100 text-red-800",
              Accepted: "bg-green-100 text-green-800",
            }[application?.status]
          }`}
        >
          {application?.status}
        </span>
      </div>
      <div>
        <button className="text-blue-600 hover:text-blue-800"onClick={()=>handleJobClick(application?.job)}>
          View Details
        </button>
      </div>
    </div>
  ))}
</div>
        </div>
      </Card>
      <Card className="p-6">
  <h2 className="text-lg font-semibold mb-4">Saved Jobs</h2>
  <div className="overflow-x-auto">
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="flex border-b py-3 bg-gray-100">
        <div className="flex-1 font-medium px-4">Company</div>
        <div className="flex-1 font-medium px-4">Position</div>
        <div className="flex-1 font-medium px-4">Location</div>
        <div className="flex-1 font-medium px-4">Salary</div>
        <div className="flex-1 font-medium px-4">Action</div>
      </div>

      {/* Job Rows */}
      {jobs.length === 0 ? (
        <div className="text-center py-6 text-gray-500 w-full">
          No saved jobs found. Start saving jobs you're interested in!
        </div>
      ) : (
        jobs.map((job) => (
          <div key={job._id} className="flex border-b hover:bg-gray-50 py-3">
            <div className="flex-1 px-4">{job.company}</div>
            <div className="flex-1 px-4">{job.title}</div>
            <div className="flex-1 px-4">{job.location.join(', ')}</div>
            <div className="flex-1 px-4 text-green-600">{job.salaryRange || "N/A"}</div>
            <div className="flex-1 px-4">
              
              <button
                className="text-blue-600 hover:text-blue-800"
                onClick={()=>handleJobClick(job)}
              >
                Apply
              </button>
              {/* <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleRemoveJob(job._id)}
              >
                Remove
              </button> */}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
</Card>
<ResumeScoreModal
          isOpen={isScoreModalOpen}
          onClose={() => setIsScoreModalOpen(false)}
          job={selectedJob}
          userData={user}
        />
    </div>
  );
};

export default StudentDashboard;