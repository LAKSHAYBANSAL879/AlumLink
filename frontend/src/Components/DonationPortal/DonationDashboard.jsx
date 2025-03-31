import React, { useContext, useState, useEffect } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Card, CardContent, Stack, Avatar, List, ListItem, ListItemText, ListItemAvatar, Divider
} from '@mui/material';
import {
  TrendingUp, Assignment, AccountBalance, PersonOutline, AccessTime
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell
} from 'recharts';
import { UserContext } from '../../userContext';
import { Link } from 'react-router-dom';
import DonationRequestModal from './DonationRequestModal';
import axios from 'axios'; // Make sure to import axios

const DonationDashboard = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { user } = useContext(UserContext);
  const userId=user?._id;
  const [donationRequests, setDonationRequests] = useState([]);
  const [topDonors, setTopDonors] = useState([]);
  const [monthlyDonations, setMonthlyDonations] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [myRecentRequests, setMyRecentRequests] = useState([]);
  const [myRecentDonations, setMyRecentDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalRequests: 0,
    myRequests: 0,
    myDonations: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/donations/all');
      setDonationRequests(Array.isArray(response.data) ? response.data : []);
      processCategories(Array.isArray(response.data) ? response.data : [])
      processMonthlyData(Array.isArray(response.data) ? response.data : [])

    } catch (err) {
      alert("Failed to load donations.");
    }
  };
  // console.log("all donations are",donationRequests.length)
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch top donors
      const topDonorsRes = await axios.get('http://localhost:8080/api/v1/donations/top-donors');
      setTopDonors(topDonorsRes.data.topDonors.map(donor => ({
        name: donor.donor,
        amount: donor.totalDonated
      })));

      // Fetch my donation requests
      const myRequestsRes = await axios.get(`http://localhost:8080/api/v1/donations/my-requests/${userId}`);
      // console.log("my requests rep is",myRequestsRes)
      setMyRecentRequests(myRequestsRes.data.map(request => ({
        title: request.title,
        category: request.category,
        amount: request.amountRequired,
        date: request.createdAt,
        status: getRequestStatus(request)
      })).slice(0, 4)); 

      // Fetch my donations
      const myDonationsRes = await axios.get(`http://localhost:8080/api/v1/donations/my-donations/${userId}`);
      setMyRecentDonations(myDonationsRes.data.map(donation => ({
        title: donation.donationRequest.title,
        recipient: donation.donationRequest.createdBy?.name || 'Anonymous',
        amount: donation.amountDonated,
        date: donation?.donationRequest?.createdAt
      })).slice(0, 4)); 

      setStats({
        totalDonations: topDonorsRes.data.topDonors.reduce((sum, donor) => sum + donor.totalDonated, 0),
        totalRequests: 0,
        myRequests: myRequestsRes.data.length || 0,
        myDonations: myDonationsRes.data.reduce((sum, donation) => sum + donation.amountDonated, 0),
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const processCategories = (donations) => {
    if (donations.length > 0) {
      const categoryCounts = donations.reduce((acc, request) => {
        const category = request.category || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      
      // Convert to array format for pie chart
      const categoryDataArray = Object.entries(categoryCounts).map(([name, value]) => ({ 
        name, 
        value,
        // Add amount data for better visualization
        amount: donations
          .filter(req => req.category === name)
          .reduce((sum, req) => sum + (req.amountRequired || 0), 0)
      }));
      
      setCategoryData(categoryDataArray);
    }
  };
  const processMonthlyData = (donations) => {
    if (donations.length > 0) {
      // Create a map to store monthly data
      const monthlyData = {};
      
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Process each donation
      donations.forEach(request => {
        if (request.createdAt) {
          const date = new Date(request.createdAt);
          const year = date.getFullYear();
          
          // Only process current year's data
          if (year === currentYear) {
            const month = date.toLocaleString('default', { month: 'short' });
            
            if (!monthlyData[month]) {
              monthlyData[month] = {
                month,
                donations: 0,
                requests: 0
              };
            }
            
            // Increment request count
            monthlyData[month].requests += 1;
            
            // Add donation amount if available
            monthlyData[month].donations += request.amountDonated || 0;
          }
        }
      });
      

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const sortedMonthlyData = months
        .filter(month => monthlyData[month]) 
        .map(month => monthlyData[month]);
      
      setMonthlyDonations(sortedMonthlyData);
    }
  };
  // Helper function to determine request status
  const getRequestStatus = (request) => {
    const now = new Date();
    const deadlineDate = new Date(request.deadline);
    
    if (request.amountRaised >= request.amountRequired) {
      return 'Funded';
    } else if (request.amountRaised > 0) {
      return 'Partially Funded';
    } else if (deadlineDate < now) {
      return 'Completed';
    } else {
      return 'Active';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Dictionary of card configurations
  const cards = [
    {
      icon: <TrendingUp />,
      iconBg: 'bg-blue-500',
      label: 'Total Platform Donations',
      value: `Rs${(stats.totalDonations / 1000).toFixed(1)}k`,
    },
    {
      icon: <Assignment />,
      iconBg: 'bg-yellow-500',
      label: 'Total Requests',
      value: donationRequests.length,
    },
    {
      icon: <PersonOutline />,
      iconBg: 'bg-sky-500',
      label: 'My Requests',
      value: stats.myRequests,
    },
    {
      icon: <AccountBalance />,
      iconBg: 'bg-green-500',
      label: 'My Donations',
      value: `Rs${(stats.myDonations / 1000).toFixed(1)}k`,
    }
  ];
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2">{`${label}: $${payload[0].value.toLocaleString()}`}</Typography>
        </Paper>
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return '#3b82f6'; // blue
      case 'Funded': return '#10b981'; // green
      case 'Partially Funded': return '#f59e0b'; // amber
      case 'Completed': return '#6b7280'; // gray
      default: return '#000000';
    }
  };

  if (isLoading && user) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h5">Loading dashboard data...</Typography>
      </Container>
    );
  }
console.log("stats are",categoryData);
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <div className='flex justify-between'>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          My Donation Dashboard
        </Typography>
        {user ? (
          <button 
            className="w-auto h-12 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors duration-200 font-medium shadow-sm"
            onClick={() => setModalOpen(true)}
          >
            Post Donation request
          </button>
        ) : (
          <Link to='/login'>
            <button className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Login first 
            </button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {cards.map((card, index) => (
          <div key={index} className="p-6 bg-white rounded-xl shadow-md flex items-center space-x-4">
            <div className={`p-3 rounded-full ${card.iconBg} text-white`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">{card.label}</p>
              <p className="text-2xl font-semibold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Monthly Trend */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Donations & Requests Trend
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart data={monthlyDonations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="donations"
                    stroke="#8884d8"
                    name="Donations ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="requests"
                    stroke="#82ca9d"
                    name="Requests"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Donation Requests by Me */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ mr: 1 }} />
              My Recent Donation Requests
            </Typography>
            {myRecentRequests.length > 0 ? (
              <List>
                {myRecentRequests.map((request, index) => (
                  <React.Fragment key={request.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getStatusColor(request.status) }}>
                          {request.category.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'medium' }}>
                            {request.title}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                               {request.category} • ${request.amount.toLocaleString()}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="body2">{formatDate(request.date)}</Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: getStatusColor(request.status),
                                  fontWeight: 'medium'
                                }}
                              >
                                {request.status}
                              </Typography>
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < myRecentRequests.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" sx={{ py: 2 }}>
                You haven't created any donation requests yet.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Donations Made by Me */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ mr: 1 }} />
              My Recent Donations
            </Typography>
            {myRecentDonations.length > 0 ? (
              <List>
                {myRecentDonations.map((donation, index) => (
                  <React.Fragment key={donation.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#8884d8' }}>
                          {donation.recipient.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'medium' }}>
                            {donation.title}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              To: {donation.recipient}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="body2">{formatDate(donation.date)}</Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: '#10b981',  // green
                                  fontWeight: 'medium'
                                }}
                              >
                                ${donation.amount.toLocaleString()}
                              </Typography>
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < myRecentDonations.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" sx={{ py: 2 }}>
                You haven't made any donations yet.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Top Donors Bar Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Donors
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={topDonors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="amount"
                    fill="lightBlue"
                    name="Donation Amount ($)"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <DonationRequestModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        userData={user}
      />
    </Container>
  );
};

export default DonationDashboard;