import React, { useState, useContext } from 'react';
import { Tabs, Tab, Box, Typography, useMediaQuery } from '@mui/material';
import JobsPage from './JobsPage';
import StudentDashboard from './StudentDashboard';
import HrDashboard from './HrDashboard';
import { UserContext } from '../../userContext';
import { useTheme } from '@mui/material/styles';

const JobHome = () => {
  const { user } = useContext(UserContext);
  const isStudent = user?.role === "student";

  const [activeTab, setActiveTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderContent = () => {
    if (activeTab === 0) return <JobsPage />;
    if (activeTab === 1) return <StudentDashboard />;
    return <HrDashboard />;
  };

  return (
    <div className="mt-4 px-2 sm:px-6">
      <Typography
        variant={isMobile ? "h6" : "h4"}
        align="center"
        gutterBottom
        sx={{
          fontWeight: '700',
          fontFamily: 'sans-serif',
          px: 2,
        }}
      >
        Unlock Your Potential: Find Jobs and Internships Tailored for You
      </Typography>

      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          aria-label="Job Home Navigation Tabs"
          variant={isMobile ? "scrollable" : "standard"} 
          scrollButtons={isMobile ? "auto" : false}
          centered={!isMobile}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Jobs/Internship" sx={{ fontSize: { xs: '14px', sm: '16px', md: '18px' } }} />
          <Tab label="Dashboard" sx={{ fontSize: { xs: '14px', sm: '16px', md: '18px' } }} />
          {!isStudent && (
            <Tab label="HR Dashboard" sx={{ fontSize: { xs: '14px', sm: '16px', md: '18px' } }} />
          )}
        </Tabs>
      </Box>

      <Box p={{ xs: 1, sm: 3 }}>{renderContent()}</Box>
    </div>
  );
};

export default JobHome;
