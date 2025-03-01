import React, { useState, useContext } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import JobsPage from './JobsPage';
import StudentDashboard from './StudentDashboard';
import HrDashboard from './HrDashboard';
import { UserContext } from '../../userContext';


const JobHome = () => {
  const { user } = useContext(UserContext); 
  const isStudent = user?.role === "student";

  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderContent = () => {
    if (activeTab === 0) return <JobsPage />;
    if (activeTab === 1) return <StudentDashboard />;
    return <HrDashboard />;
  };

  return (
    <div className='mt-4'>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontWeight: '700',
          fontFamily: 'sans-serif',
        }}
      >
        Unlock Your Potential: Find Jobs and Internships Tailored for You
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleChange}
        aria-label="Job Home Navigation Tabs"
        centered
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Jobs/Internship" sx={{ fontSize: '18px' }} />
        <Tab label="Dashboard" sx={{ fontSize: '18px' }} />
        {!isStudent && <Tab label="HR Dashboard" sx={{ fontSize: '18px' }} />}
      </Tabs>

      <Box p={3}>{renderContent()}</Box>
    </div>
  );
};

export default JobHome;
