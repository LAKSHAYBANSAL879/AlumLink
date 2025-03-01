import React from 'react';
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

const DonationDashboard = () => {
  // Sample data
  const monthlyDonations = [
    { month: 'Jan', donations: 15000, requests: 45 },
    { month: 'Feb', donations: 18000, requests: 52 },
    { month: 'Mar', donations: 22000, requests: 58 },
    { month: 'Apr', donations: 19000, requests: 48 },
    { month: 'May', donations: 25000, requests: 62 },
    { month: 'Jun', donations: 28000, requests: 65 }
  ];

  const topDonors = [
    { name: 'John Smith', amount: 12500 },
    { name: 'Emma Wilson', amount: 10800 },
    { name: 'Michael Brown', amount: 9500 },
    { name: 'Sarah Davis', amount: 8200 },
    { name: 'James Johnson', amount: 7800 }
  ];

  const categoryData = [
    { name: 'Medical', value: 35 },
    { name: 'Education', value: 25 },
    { name: 'Disaster Relief', value: 20 },
    { name: 'Animal Welfare', value: 12 },
    { name: 'Others', value: 8 }
  ];
  
  // New data for recent requests
  const myRecentRequests = [
    { id: 'REQ-1234', title: 'School Supplies for Children', category: 'Education', amount: 1500, date: '2025-02-20', status: 'Active' },
    { id: 'REQ-1189', title: 'Emergency Medical Fund', category: 'Medical', amount: 3000, date: '2025-02-15', status: 'Funded' },
    { id: 'REQ-1156', title: 'Community Garden Project', category: 'Community', amount: 800, date: '2025-02-10', status: 'Partially Funded' },
    { id: 'REQ-1098', title: 'Animal Shelter Support', category: 'Animal Welfare', amount: 1200, date: '2025-02-01', status: 'Completed' }
  ];
  
  // New data for recent donations
  const myRecentDonations = [
    { id: 'DON-2345', title: 'Hurricane Relief Fund', recipient: 'Red Cross', amount: 1000, date: '2025-02-23' },
    { id: 'DON-2320', title: 'Children\'s Hospital Equipment', recipient: 'City Hospital', amount: 1500, date: '2025-02-18' },
    { id: 'DON-2289', title: 'Scholarship Program', recipient: 'Education First', amount: 800, date: '2025-02-12' },
    { id: 'DON-2254', title: 'Wildlife Conservation', recipient: 'Nature Trust', amount: 500, date: '2025-02-05' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const stats = {
    totalDonations: 25000,
    totalRequests: 156,
    myRequests: 23,
    myDonations: 5000
  };

  // Dictionary of card configurations
  const cards = [
    {
      icon: <TrendingUp />,
      iconBg: 'bg-blue-500',
      label: 'Total Platform Donations',
      value: `$${(stats.totalDonations / 1000).toFixed(1)}k`,
    },
    {
      icon: <Assignment />,
      iconBg: 'bg-yellow-500',
      label: 'Total Requests',
      value: stats.totalRequests,
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
      value: `$${(stats.myDonations / 1000).toFixed(1)}k`,
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

  // Helper function to format date
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        My Donation Dashboard
      </Typography>

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

        {/* NEW SECTION: Recent Donation Requests by Me */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ mr: 1 }} />
              My Recent Donation Requests
            </Typography>
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
                            {request.id} • {request.category} • ${request.amount.toLocaleString()}
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
          </Paper>
        </Grid>

        {/* NEW SECTION: Recent Donations Made by Me */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ mr: 1 }} />
              My Recent Donations
            </Typography>
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
                            {donation.id} • To: {donation.recipient}
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
    </Container>
  );
};

export default DonationDashboard;