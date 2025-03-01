import React, { useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button, Modal
} from '@mui/material';

const categoryOptions = ['Medical', 'Education', 'Disaster Relief', 'Animal Welfare', 'Others'];

const DonationRequestModal = ({ open, onClose, onSubmit }) => {
  const [donationData, setDonationData] = useState({
    title: '',
    category: '',
    description: '',
    totalDonation: '',
    maxDate: '',
    documents: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDonationData({ ...donationData, [name]: value });
  };

  const handleFileChange = (e) => {
    setDonationData({ ...donationData, documents: e.target.files });
  };

  const handleSubmit = () => {
    onSubmit(donationData);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'white',
          p: 4,
          borderRadius: 2,
          boxShadow: 24
        }}
      >
        <Typography variant="h6" mb={2}>Post a Donation Request</Typography>
        <TextField
          fullWidth
          label="Donation Title"
          name="title"
          value={donationData.title}
          onChange={handleInputChange}
          margin="dense"
        />
        <TextField
          select
          fullWidth
          label="Category"
          name="category"
          value={donationData.category}
          onChange={handleInputChange}
          margin="dense"
        >
          {categoryOptions.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="About Donation"
          name="description"
          value={donationData.description}
          onChange={handleInputChange}
          margin="dense"
        />
        <TextField
          fullWidth
          type="number"
          label="Total Donation Needed"
          name="totalDonation"
          value={donationData.totalDonation}
          onChange={handleInputChange}
          margin="dense"
        />
        <TextField
          fullWidth
          type="date"
          label="Max Limit Date"
          name="maxDate"
          value={donationData.maxDate}
          onChange={handleInputChange}
          margin="dense"
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }}>
          Upload Documents (PDF)
          <input type="file" hidden multiple accept="application/pdf" onChange={handleFileChange} />
        </Button>
        <Button fullWidth variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>
          Submit Request
        </Button>
      </Box>
    </Modal>
  );
};

export default DonationRequestModal;
