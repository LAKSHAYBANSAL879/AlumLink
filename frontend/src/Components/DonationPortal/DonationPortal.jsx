import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, CardMedia, Typography, Button, LinearProgress, Chip, Box, Container, Grid, Stack, Avatar, Divider, IconButton, Paper, List, ListItem, ListItemIcon, ListItemText, Tooltip, Modal, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { 
  Favorite as HeartIcon, CalendarToday as CalendarIcon, Timeline as TargetIcon, Description as DocumentIcon,
  Download as DownloadIcon, AccountCircle as UserIcon, Category as CategoryIcon, VerifiedUser as VerifiedIcon,
  People as PeopleIcon, Close as CloseIcon, Check as CheckIcon, Cancel as CancelIcon
} from '@mui/icons-material';

const DonationPortal = () => {
  // Mock logged in user (for demo purposes)
  const [loggedInUser, setLoggedInUser] = useState({
    id: 1, // This matches with John Smith's request
    name: "John Smith",
    isAdmin: true
  });

  // State for donation requests
  const [donationRequests, setDonationRequests] = useState([
    {
      id: 1,
      title: "Medical Emergency Fund",
      description: "Urgent medical treatment needed for cancer patient. We are seeking support for critical medical procedures and ongoing care requirements.",
      requester: "John Smith",
      requesterId: 1, // Added to match with logged in user ID
      requesterAvatar: "/api/placeholder/40/40",
      targetAmount: 5000,
      currentAmount: 3200,
      deadline: "2025-03-15",
      category: "Medical",
      isVerified: true,
      documents: [
        { name: "Medical_Report.pdf", size: "2.4 MB", type: "application/pdf" },
        { name: "Hospital_Bill.pdf", size: "1.1 MB", type: "application/pdf" },
        { name: "Doctor_Statement.pdf", size: "890 KB", type: "application/pdf" }
      ],
      donorsCount: 45,
      donors: [
        { id: 101, name: "Emma Wilson", amount: 500, date: "2025-02-20", avatar: "/api/placeholder/40/40" },
        { id: 102, name: "James Davis", amount: 250, date: "2025-02-18", avatar: "/api/placeholder/40/40" },
        { id: 103, name: "Olivia Martinez", amount: 1000, date: "2025-02-15", avatar: "/api/placeholder/40/40" },
        { id: 104, name: "Anonymous Donor", amount: 150, date: "2025-02-12", avatar: null },
        { id: 105, name: "Michael Brown", amount: 300, date: "2025-02-10", avatar: "/api/placeholder/40/40" }
      ]
    },
    {
      id: 2,
      title: "Education Support Program",
      description: "Help provide school supplies for underprivileged children. This initiative aims to support 100 students with essential educational materials.",
      requester: "Sarah Johnson",
      requesterId: 2,
      requesterAvatar: "/api/placeholder/40/40",
      targetAmount: 2000,
      currentAmount: 800,
      deadline: "2025-03-30",
      category: "Education",
      isVerified: false,
      documents: [
        { name: "Program_Details.pdf", size: "1.8 MB", type: "application/pdf" },
        { name: "Budget_Breakdown.xlsx", size: "756 KB", type: "application/excel" }
      ],
      donorsCount: 23,
      donors: [
        { id: 201, name: "Robert Johnson", amount: 200, date: "2025-02-19", avatar: "/api/placeholder/40/40" },
        { id: 202, name: "Patricia Taylor", amount: 150, date: "2025-02-17", avatar: "/api/placeholder/40/40" },
        { id: 203, name: "Anonymous Donor", amount: 100, date: "2025-02-14", avatar: null },
        { id: 204, name: "Thomas Anderson", amount: 200, date: "2025-02-11", avatar: "/api/placeholder/40/40" },
        { id: 205, name: "Anonymous Donor", amount: 150, date: "2025-02-08", avatar: null }
      ]
    }
  ]);

  // State for donor list modal
  const [donorModalOpen, setDonorModalOpen] = useState(false);
  const [currentDonors, setCurrentDonors] = useState([]);


  const calculateProgress = (current, target) => {
    return (current / target) * 100;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getDaysRemaining = (deadline) => {
    const remaining = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return remaining > 0 ? remaining : 0;
  };

  const handleDownload = (documentName) => {
    // Implement document download logic here
    console.log(`Downloading ${documentName}`);
  };

  // New function to toggle verification status
  const toggleVerificationStatus = (requestId) => {
    setDonationRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId 
          ? { ...req, isVerified: !req.isVerified } 
          : req
      )
    );
  };

  // Function to open donor list modal
  const openDonorModal = (donors) => {
    setCurrentDonors(donors);
    setDonorModalOpen(true);
  };

  // Function to close donor list modal
  const closeDonorModal = () => {
    setDonorModalOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Make a Difference Today
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
          Browse through verified donation requests and support causes that matter
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {donationRequests.map((request) => (
          <Grid item xs={12} key={request.id}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={request.requesterAvatar} alt={request.requester} />
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {request.title}
                        {request.isVerified && (
                          <Tooltip title="Verified Request">
                            <VerifiedIcon sx={{ ml: 1, color: 'primary.main', fontSize: '20px' }} />
                          </Tooltip>
                        )}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="subtitle2" color="text.secondary">
                          by {request.requester}
                        </Typography>
                        <Chip 
                          label={request.category}
                          color="primary"
                          size="small"
                          icon={<CategoryIcon />}
                        />
                      </Stack>
                    </Box>
                  </Box>
                  
                  {/* Admin Verification Control */}
                  {loggedInUser.isAdmin && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={request.isVerified}
                            onChange={() => toggleVerificationStatus(request.id)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {request.isVerified ? "Verified" : "Not Verified"}
                          </Typography>
                        }
                      />
                    </Box>
                  )}
                </Box>

                <Typography variant="body1" sx={{ mb: 4 }}>
                  {request.description}
                </Typography>

                <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                    Supporting Documents
                  </Typography>
                  <List dense>
                    {request.documents.map((doc, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleDownload(doc.name)}>
                            <DownloadIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <DocumentIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={doc.name}
                          secondary={doc.size}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {formatCurrency(request.currentAmount)} raised of {formatCurrency(request.targetAmount)}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {request.donorsCount} donors
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculateProgress(request.currentAmount, request.targetAmount)}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'grey.100',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center"
                >
                  <Stack direction="row" spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {getDaysRemaining(request.deadline)} days left
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TargetIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {Math.round(calculateProgress(request.currentAmount, request.targetAmount))}% funded
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    {/* View Donors Button (only for request owner) */}
                    {loggedInUser.id === request.requesterId && (
                      <Button 
                        variant="outlined"
                        color="primary"
                        startIcon={<PeopleIcon />}
                        onClick={() => openDonorModal(request.donors)}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 'medium'
                        }}
                      >
                        View Donors
                      </Button>
                    )}
                    
                    <Button 
                      variant="contained" 
                      color="primary"
                      size="large"
                      startIcon={<HeartIcon />}
                      sx={{ 
                        borderRadius: 2,
                        px: 4,
                        textTransform: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      Donate Now
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Donor List Modal */}
      <Dialog
        open={donorModalOpen}
        onClose={closeDonorModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ mr: 1 }} /> Donor List
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={closeDonorModal}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Donor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentDonors.map((donor) => (
                  <TableRow key={donor.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={donor.avatar} alt={donor.name}>
                          {!donor.avatar && donor.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{donor.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(donor.date).toLocaleDateString()}</TableCell>
                    <TableCell align="right">{formatCurrency(donor.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDonorModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DonationPortal;