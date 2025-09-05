import React, { useContext, useEffect, useState } from 'react';
import {
  Card, CardContent, CardMedia, Typography, Button, LinearProgress, Chip, Box, Container, Grid, Stack, Avatar, Divider, IconButton, Paper, List, ListItem, ListItemIcon, ListItemText, Tooltip, Modal, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, TextField
} from '@mui/material';
import { 
  Favorite as HeartIcon, CalendarToday as CalendarIcon, Timeline as TargetIcon, Description as DocumentIcon,
  Download as DownloadIcon, AccountCircle as UserIcon, Category as CategoryIcon, VerifiedUser as VerifiedIcon,
  People as PeopleIcon, Close as CloseIcon, Check as CheckIcon, Cancel as CancelIcon
} from '@mui/icons-material';
import {
  Verified as VerifiedIco,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon
} from "@mui/icons-material";
import { UserContext } from '../../userContext';
import axios from 'axios';
import { BadgeInfo } from 'lucide-react';
import DonationModal from './DonationModal';
import DonarsDialog from './DonarsDialog'

const DonationPortal = () => {
  const { user } = useContext(UserContext);

  const [donationRequests, setDonationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donorModalOpen, setDonorModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedDonationRequest, setSelectedDonationRequest] = useState(null);
  const [selectedDonationRequestId, setSelectedDonationRequestId] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [currentRequestForStatus, setCurrentRequestForStatus] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchDonations();
  }, []);

const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://alumlink-ruo3.onrender.com/api/v1/donations/all');
      
      const currentDate = new Date();
      const filteredDonations = Array.isArray(response.data) 
        ? response.data.filter(donation => {
            const deadlineDate = new Date(donation.deadline);
            return deadlineDate >= currentDate;
          })
        : [];
      
      setDonationRequests(filteredDonations);
    } catch (err) {
      setError("Failed to load donations.");
    } finally {
      setLoading(false);
    }
  };
  const isExpired = (deadline) => {
    const deadlineDate = new Date(deadline);
    const currentDate = new Date();
    return deadlineDate < currentDate;
  };

  const handleExpiredRequest = async (requestId) => {
    try {
      await axios.delete(`https://alumlink-ruo3.onrender.com/api/v1/donations/${requestId}/deleteExp`);
      fetchDonations();
    } catch (error) {
      console.error("Error handling expired request:", error);
    }
  };

  useEffect(() => {
    const checkExpiredDonations = () => {
      donationRequests.forEach(donation => {
        if (isExpired(donation.deadline)) {
          handleExpiredRequest(donation._id);
        }
      });
    };

    if (donationRequests.length > 0) {
      checkExpiredDonations();
    }

    const intervalId = setInterval(checkExpiredDonations, 3600000); 

    return () => clearInterval(intervalId);
  }, [donationRequests]);
  
  if (loading) return <p>Loading donations...</p>;
  if (error) return <p>{error}</p>;

  const calculateProgress = (current, target) => {
    return (current / target) * 100;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getDaysRemaining = (deadline) => {
    const remaining = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return remaining > 0 ? remaining : 0;
  };

  const handleDownload = (documentPath) => {
   
    if (documentPath.startsWith('http://') || documentPath.startsWith('https://')) {
     
      window.open(documentPath, '_blank');
    } else {
      
      const fileUrl = `https://alumlink-ruo3.onrender.com/api/v1/donations/${documentPath}`;
      window.open(fileUrl, '_blank');
    }
  };
  const getDocumentDisplayName = (documentPath, index) => {
    
    if (documentPath.startsWith('http://') || documentPath.startsWith('https://')) {
      
      const parts = documentPath.split('/');
      const filename = parts[parts.length - 1];
      const extension = filename.split('.').pop();
      
      
      return `Document ${index + 1}.${extension}`;
    } else {
      
      return documentPath.split('\\').pop().split('-').slice(1).join('-');
    }
  };
  const openStatusDialog = (request) => {
    setCurrentRequestForStatus(request);
    setSelectedStatus(request.status || 'pending');
    setAdminRemarks(request.adminRemark || '');
    setStatusDialogOpen(true);
  };

  const closeStatusDialog = () => {
    setStatusDialogOpen(false);
    setCurrentRequestForStatus(null);
    setAdminRemarks('');
  };

  // Function to handle status change submission
  const handleStatusChange = async () => {
    try {
      const requestId=currentRequestForStatus?._id;
      const response = await axios.put(
        `https://alumlink-ruo3.onrender.com/api/v1/donations/${requestId}/status`,
        {
          status: selectedStatus,
          adminRemarks: adminRemarks,
          adminId: user?._id
        }
      );
      
      // Update the local state with the new status information
      setDonationRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === currentRequestForStatus._id 
            ? { ...req, status: selectedStatus, adminRemark: adminRemarks, verifiedBy: user?._id } 
            : req
        )
      );
      
      closeStatusDialog();
    } catch (error) {
      console.error('Error updating donation status:', error);
    }
  };

  // Function to open donor list modal
  const openDonorModal = (donationRequestId) => {
    setSelectedDonationRequestId(donationRequestId);
    setDonorModalOpen(true);
  };

  // Function to close donor list modal
  const closeDonorModal = () => {
    setDonorModalOpen(false);
  };

  const openDonationModal = (request) => {
    setSelectedDonationRequest(request);
    setDonationModalOpen(true);
  };

  // Close donation modal
  const closeDonationModal = () => {
    setDonationModalOpen(false);
  };

  const getVerificationIcon = (status, remark) => {
    switch (status) {
      case "approved":
        return (
          <Tooltip title={remark}>
             <VerifiedIco sx={{ color: "green" }} />
          </Tooltip>
           
         
        );
      case "pending":
        return (
          <Tooltip title={remark}>
            <PendingIcon sx={{ color: "orange" }} />
            </Tooltip>
         
        );
      case "rejected":
        return (
          <Tooltip title={remark}>
            <RejectedIcon sx={{ color: "red" }} />
            </Tooltip>
          
        );
      default:
        return (
            <BadgeInfo color="primary" />
        );
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "pending":
      default:
        return "Pending";
    }
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
        {donationRequests?.length > 0 ? (
          donationRequests?.map((request) => (
            <Grid item xs={12} key={request?._id}>
              <Card sx={{ 
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={request?.createdBy?.avatar} alt={request?.createdBy?.name} />
                      <Box>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
                          {request.title}
                          {getVerificationIcon(request?.status, request.adminRemarks)}
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="subtitle2" color="text.secondary">
                            by {request?.createdBy?.name}
                          </Typography>
                          <Chip 
                            label={request.category}
                            color="primary"
                            size="small"
                            icon={<CategoryIcon />}
                          />
                          <Chip 
                            label={getStatusLabel(request?.status)}
                            color={
                              request?.status === "approved" ? "success" : 
                              request?.status === "rejected" ? "error" : 
                              "warning"
                            }
                            size="small"
                          />
                        </Stack>
                      </Box>
                    </Box>
                    
                    {/* Admin Control Section */}
                    {user?.role === "admin" && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                          variant="outlined"
                          onClick={() => openStatusDialog(request)}
                          startIcon={request?.status === "approved" ? <VerifiedIco /> : <PendingIcon />}
                          color={
                            request?.status === "approved" ? "success" : 
                            request?.status === "rejected" ? "error" : 
                            "warning"
                          }
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'medium'
                          }}
                        >
                          {request?.status === "pending" ? "Review" : "Change Status"}
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Typography className='' sx={{textAlign:'left'}}>
                    {request?.description}
                  </Typography>

                  <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                      Supporting Documents
                    </Typography>
                    <List dense>
                      {request?.supportingDocuments?.map((doc, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleDownload(doc)}>
                              <DownloadIcon />
                            </IconButton>
                          }
                        >
                          <ListItemIcon>
                            <DocumentIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={getDocumentDisplayName(doc,index)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>

                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {formatCurrency(request?.amountRaised)} raised of {formatCurrency(request?.amountRequired)}
                      </Typography>
                   
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateProgress(request?.amountRaised, request?.amountRequired)}
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
                          {getDaysRemaining(request?.deadline)} days left
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TargetIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {Math.round(calculateProgress(request?.amountRaised, request?.amountRequired))}% funded
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2}>
                      {/* View Donors Button (only for request owner) */}
                      {user?._id === request?.createdBy?._id && (
                        <Button 
                          variant="outlined"
                          color="primary"
                          startIcon={<PeopleIcon />}
                          onClick={() => openDonorModal(request?._id)}
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
                        onClick={() => openDonationModal(request)}
                        disabled={request?.status !== "approved" || request?.amountRaised>=request?.amountRequired}
                      >
                        Donate Now
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="h6" textAlign="center">
            No donation requests available.
          </Typography> 
        )}
      </Grid>

      {/* Admin Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={closeStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Review Donation Request</Typography>
            <IconButton onClick={closeStatusDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {currentRequestForStatus?.title}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom color="text.secondary">
                Status
              </Typography>
              <Select
                fullWidth
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                size="small"
                sx={{ mb: 3 }}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
              
              <Typography variant="body2" gutterBottom color="text.secondary">
                Admin Remarks
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Add your remarks about this donation request"
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleStatusChange} 
            variant="contained" 
            color={selectedStatus === "approved" ? "success" : selectedStatus === "rejected" ? "error" : "primary"}
            startIcon={selectedStatus === "approved" ? <CheckIcon /> : selectedStatus === "rejected" ? <CancelIcon /> : <PendingIcon />}
          >
            {selectedStatus === "approved" ? "Approve" : selectedStatus === "rejected" ? "Reject" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Donor List Dialog */}
      <DonarsDialog 
        open={donorModalOpen}
        donationRequestId={selectedDonationRequestId}
        onClose={closeDonorModal}
      />

      {/* Donation Modal */}
      {selectedDonationRequest && (
        <DonationModal
          open={donationModalOpen}
          onClose={closeDonationModal}
          donationRequestId={selectedDonationRequest._id}
          donorId={user?._id}
          title={selectedDonationRequest.title}
        />
      )}
    </Container>
  );
};

export default DonationPortal;