import React, { useState, useContext } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import DonationPortal from './DonationPortal';
import DonationDashboard from './DonationDashboard';


const DonationHome = () => {

  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderContent = () => {
    if (activeTab === 0) return <DonationPortal />;
    if (activeTab === 1) return <DonationDashboard/>;
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
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleChange}
        aria-label="Job Home Navigation Tabs"
        centered
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Donations" sx={{ fontSize: '18px' }} />
        <Tab label="Dashboard" sx={{ fontSize: '18px' }} />
        </Tabs>

      <Box p={3}>{renderContent()}</Box>
    </div>
  );
};

export default DonationHome;
