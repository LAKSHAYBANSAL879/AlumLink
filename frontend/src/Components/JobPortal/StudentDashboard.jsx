import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, CardContent, Tab, Tabs, Typography, Box } from '@mui/material';
import { LineChart, DoughnutChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { Calendar, Mail, Award, Clock, Search, TrendingUp, Bookmark, Building, MapPin, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../userContext';
import axios from 'axios';
import ResumeScoreModal from './ResumeScoreModal';

const StudentDashboard = () => {
  // All existing state variables
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selected, setSelectedCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [applicationTrends, setApplicationTrends] = useState([]);
  const [jobsData, setJobsData] = useState([]);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [marketInsights, setMarketInsights] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Default market insights as fallback
  const defaultMarketInsights = [
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

  // Fetch market trends from Gemini API
  const fetchMarketTrends = async () => {
    const apiKey = process.env.REACT_APP_GEMINI_KEY;
    
    if (!apiKey) {
      console.warn('Gemini API key not found in environment variables');
      setMarketInsights(defaultMarketInsights);
      return;
    }

    setTrendsLoading(true);
    
    try {
      const prompt = `As a career market analyst, provide 3 key insights for job seekers in the technology sector. Focus on:
      1. High demand skills currently sought by employers mention only skills name
      2. Salary and compensation trends
      3. Interview focus areas and what companies are prioritizing

      Format your response as a JSON array with exactly 3 objects, each containing:
      - title: Brief category title (e.g., "High Demand Skills") only name of skills in single word
      - insights: Array of 3 specific items/skills/trends each must not exceed 10 words
      - trend: One sentence describing the overall trend must not exceed 40 words

      Example format:
      [
        {
          "title": "High Demand Skills",
          "insights": ["React.js", "TypeScript", "AWS"],
          "trend": "Increasing demand in enterprise companies"
        }
      ]`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const content = data.candidates[0].content.parts[0].text;
        
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedInsights = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsedInsights) && parsedInsights.length >= 3) {
              setMarketInsights(parsedInsights.slice(0, 3));
            } else {
              throw new Error('Invalid data format');
            }
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.warn('Failed to parse Gemini response:', parseError);
          setMarketInsights(defaultMarketInsights);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching market trends:', err);
      setMarketInsights(defaultMarketInsights);
    } finally {
      setTrendsLoading(false);
    }
  };

  const { user } = useContext(UserContext);
  const userId = user?._id;

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
        setJobsData(response.data);
      } catch (error) {
        console.error('Error fetching job data:', error);
      }
    };

    fetchJobs();
  }, []);

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
          <Box sx={{ py: { xs: 2, md: 3 } }}>
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
    fetchMarketTrends();
  }, [appliedJobs]);

  const jobs = Array.isArray(savedJobs) ? savedJobs : [];
  const navigate = useNavigate();
  
  const handleJobClick = (job) => {
    navigate(`/jobDesc/${job._id}`);
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

  const currentDate = new Date();
  const filteredJobs = jobsData.filter(job => 
    job.postedBy._id !== user._id && 
    (!job.applicationDeadline || new Date(job.applicationDeadline) >= currentDate)
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">My Job Search Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Track your job applications and interviews</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="p-3 md:p-6">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-2 md:p-3 bg-blue-100 rounded-full">
              <Search className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs md:text-sm text-gray-600">Total Applications</p>
              <p className="text-lg md:text-2xl font-semibold">{appliedJobs.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-6">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-2 md:p-3 bg-green-100 rounded-full">
              <Mail className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs md:text-sm text-gray-600">Saved</p>
              <p className="text-lg md:text-2xl font-semibold">{savedJobs.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-6">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-2 md:p-3 bg-purple-100 rounded-full">
              <Calendar className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs md:text-sm text-gray-600">Interviews</p>
              <p className="text-lg md:text-2xl font-semibold">{shortlistedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-6">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-2 md:p-3 bg-yellow-100 rounded-full">
              <Award className="h-4 w-4 md:h-6 md:w-6 text-yellow-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs md:text-sm text-gray-600">Offers</p>
              <p className="text-lg md:text-2xl font-semibold">{selected}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Application Timeline</h2>
          <div className="w-full h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={applicationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="offers" stroke="#7c3aed" strokeWidth={2} />
                <Line type="monotone" dataKey="interviews" stroke="#059669" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: { xs: 2, sm: 0 } }}>
              <Typography variant="h6" component="h2" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                Job Search Analytics & Insights
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Last updated: Today
              </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    fontSize: { xs: '0.8rem', md: '0.875rem' },
                    minWidth: { xs: 'auto', md: '160px' }
                  }
                }}
              >
                <Tab label="Market Insights" />
                <Tab label="Best Matches" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {trendsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-sm">Fetching latest market trends...</span>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {marketInsights.map((insight, index) => (
                    <Card key={index} className="p-4 border">
                      <h3 className="font-semibold text-base md:text-lg mb-3">{insight.title}</h3>
                      <ul className="space-y-2">
                        {insight.insights.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
                            <span className="text-xs md:text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-xs md:text-sm text-gray-600">{insight.trend}</p>
                    </Card>
                  ))}
                </div>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <div className="space-y-4">
                {filteredJobs.slice(0, 5).map((job) => (
                  <Card key={job?._id} className="p-4 md:p-5 border hover:shadow-md transition-shadow duration-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="space-y-2 flex-1">
                        <h3 className="font-semibold text-base md:text-lg">{job.title}</h3>
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                          <Building className="w-4 h-4 flex-shrink-0" />
                          {job.company}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>{job.location.join(', ')}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button 
                          className="text-sm text-gray-900 bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 transition-colors w-full sm:w-auto"
                          onClick={() => handleCheckScore(job)}
                        >
                          Check Score
                        </button>
                      </div>
                    </div>
                    <button 
                      className="mt-4 text-blue-600 text-sm hover:text-blue-800 font-medium"
                      onClick={() => handleJobClick(job)}
                    >
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
      <Card className="p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Interviews</h2>
        <div className="overflow-x-auto">
          {upcomingInterviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No upcoming interviews scheduled
            </div>
          ) : (
            <div className="min-w-full">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <div className="flex items-center border-b bg-gray-100">
                  <div className="flex-1 py-3 px-4 font-medium">Company</div>
                  <div className="flex-1 py-3 px-4 font-medium">Position</div>
                  <div className="flex-1 py-3 px-4 font-medium">Date</div>
                  <div className="flex-1 py-3 px-4 font-medium">Time</div>
                  <div className="flex-1 py-3 px-4 font-medium">Type</div>
                </div>
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {upcomingInterviews.map(interview => (
                  <div key={interview.id} className="bg-white border rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{interview.company}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {interview.type}
                        </span>
                      </div>
                      <p className="text-gray-600">{interview.position}</p>
                      <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-500 gap-1">
                        <span>{interview.date}</span>
                        <span>{interview.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Recent Applications */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Applications</h2>
        <div className="overflow-x-auto">
          {appliedJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No applications found
            </div>
          ) : (
            <div>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="flex font-semibold border-b bg-gray-100 py-3 px-4">
                  <div className="flex-1 px-4">Company</div>
                  <div className="flex-1 px-4">Position</div>
                  <div className="flex-1 px-4">Applied Date</div>
                  <div className="flex-1 px-4">Status</div>
                  <div className="flex-1 px-4">Action</div>
                </div>
                {appliedJobs.map((application) => (
                  <div
                    key={application?.id}
                    className="flex border-b py-3 px-4 hover:bg-gray-50 items-center"
                  >
                    <div className="flex-1 px-4 font-medium">{application?.job?.company}</div>
                    <div className="flex-1 px-4">{application?.job?.title}</div>
                    <div className="flex-1 px-4">{formatDate(application?.appliedAt)}</div>
                    <div className="flex-1 px-4">
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
                    <div className="flex-1 px-4">
                      <button 
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        onClick={() => handleJobClick(application?.job)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {appliedJobs.map((application) => (
                  <div key={application?.id} className="bg-white border rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{application?.job?.company}</h3>
                          <p className="text-gray-600 text-sm">{application?.job?.title}</p>
                        </div>
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
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{formatDate(application?.appliedAt)}</span>
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          onClick={() => handleJobClick(application?.job)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Saved Jobs */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Saved Jobs</h2>
        <div className="overflow-x-auto">
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No saved jobs found. Start saving jobs you're interested in!
            </div>
          ) : (
            <div>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="flex border-b py-3 bg-gray-100">
                  <div className="flex-1 font-medium px-4">Company</div>
                  <div className="flex-1 font-medium px-4">Position</div>
                  <div className="flex-1 font-medium px-4">Location</div>
                  <div className="flex-1 font-medium px-4">Salary</div>
                  <div className="flex-1 font-medium px-4">Action</div>
                </div>
                {jobs.map((job) => (
                  <div key={job._id} className="flex border-b hover:bg-gray-50 py-3">
                    <div className="flex-1 px-4">{job.company}</div>
                    <div className="flex-1 px-4">{job.title}</div>
                    <div className="flex-1 px-4">{job.location.join(', ')}</div>
                    <div className="flex-1 px-4 text-green-600">{job.salaryRange || "N/A"}</div>
                    <div className="flex-1 px-4">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleJobClick(job)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {jobs.map((job) => (
                  <div key={job._id} className="bg-white border rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{job.company}</h3>
                          <p className="text-gray-600 text-sm">{job.title}</p>
                        </div>
                        <span className="text-green-600 text-sm font-medium">
                          {job.salaryRange || "N/A"}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location.join(', ')}
                      </p>
                      <div className="flex justify-end">
                        <button
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          onClick={() => handleJobClick(job)}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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