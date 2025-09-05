import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Box, Typography, IconButton, Button, 
  Avatar, Divider, Paper, CircularProgress
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';

const DonorsDialog = ({ open, donationRequestId, onClose }) => {
  const [currentDonors, setCurrentDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDonorsForRequest = async () => {
    if (!donationRequestId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/donations/${donationRequestId}/donors`);
      const data = await response.json();
      
      if (data.success) {
        setCurrentDonors(data.donors);
      } else {
        setError(data.message || 'Failed to fetch donors');
      }
    } catch (error) {
      setError('Error fetching donors list');
      console.error('Error fetching donors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && donationRequestId) {
      fetchDonorsForRequest();
    }
  }, [open, donationRequestId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const closeDonorModal = () => {
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={closeDonorModal} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ px: 3, py: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
            <PeopleIcon sx={{ mr: 1.5 }} /> Donor List
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeDonorModal}
            aria-label="close"
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ ml: 2 }}>Loading donors...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'error.main' }}>
            <Typography variant="body1">{error}</Typography>
          </Box>
        ) : currentDonors.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1">No donors found for this request.</Typography>
          </Box>
        ) : (
          <Box sx={{ bgcolor: 'background.paper' }}>
            {/* Header */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              px: 3, 
              py: 2, 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              bgcolor: 'grey.50'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, width: '40%' }}>Donor</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, width: '30%', textAlign: 'center' }}>Date</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, width: '30%', textAlign: 'right' }}>Amount</Typography>
            </Box>
            
            {/* Donor List */}
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {currentDonors.map((donor, index) => (
                <Paper 
                  key={donor.id || index} 
                  elevation={0} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    px: 3, 
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'grey.50' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '40%' }}>
                    <Avatar 
                      src={donor.avatar} 
                      alt={donor.name}
                      sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}
                    >
                      {!donor.avatar && donor.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{donor.name}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ width: '30%', textAlign: 'center', alignSelf: 'center' }}>
                    {new Date(donor.date).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Typography>
                  <Typography variant="body1" sx={{ width: '30%', textAlign: 'right', fontWeight: 600, alignSelf: 'center' }}>
                    {formatCurrency(donor.amount)}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={closeDonorModal} 
          variant="contained" 
          color="primary"
          sx={{ px: 3, py: 1, borderRadius: 1 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DonorsDialog;