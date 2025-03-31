import React, { useState } from 'react';
import {
  Box, 
  Typography, 
  TextField, 
  MenuItem, 
  Button, 
  Modal, 
  Chip, 
  Stack,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { toast } from 'react-toastify';

const categoryOptions = ['Medical', 'Education', 'Disaster Relief', 'Animal Welfare', 'Others'];

const DonationRequestModal = ({ open, onClose,userData }) => {
  const [donationData, setDonationData] = useState({
    title: '',
    category: '',
    description:'',
    totalDonation: '',
    maxDate: '',
    documents: []
  });
  
  const [error, setError] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDonationData({ ...donationData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setDonationData((prevData) => ({
      ...prevData,
      documents: [...prevData.documents, ...files]
    }));
    setError(false);
  };

  const handleRemoveFile = (index) => {
    setDonationData((prevData) => {
      const updatedDocs = [...prevData.documents];
      updatedDocs.splice(index, 1);
      return { ...prevData, documents: updatedDocs };
    });
  };

  const handleSubmit = async () => {
    if (!donationData.title || !donationData.description || !donationData.totalDonation || !donationData.maxDate || donationData.documents.length === 0) {
      setError(true);
      return;
    }

    const formData = new FormData();
    formData.append("title", donationData.title);
    formData.append("category", donationData.category);
    formData.append("description", donationData.description);
    formData.append("amountRequired", donationData.totalDonation);
    formData.append("deadline", donationData.maxDate);
    
    // Append files
    donationData.documents.forEach((file) => {
      formData.append("supportingDocuments", file);
    });
    if (userData?._id) {
      formData.append("createdBy", userData._id);
    }
    try {
      const response = await axios.post("http://localhost:8080/api/v1/donations/newDonation", formData);
      console.log("Success:", response.data);
      toast.success("new donation request added sucessfully")
      // onSubmit(response.data);
      onClose();
    } catch (error) {
      console.error("Error submitting donation request:", error);
    }
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Post a Donation Request</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

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
          value={donationData?.category}
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
        
        <Button 
          variant="contained" 
          component="label" 
          fullWidth 
          sx={{ mt: 2 }}
          color={error ? "error" : "primary"}
        >
          Upload Documents (PDF) *
          <input
            type="file"
            hidden
            multiple
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </Button>
        
        {error && (
          <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
            Please upload at least one document
          </Typography>
        )}
        
        {/* Display selected files as Chips */}
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
          {donationData.documents.map((file, index) => (
            <Chip
              key={index}
              label={file.name}
              onDelete={() => handleRemoveFile(index)}
              color="success"
            />
          ))}
        </Stack>
        
        <Button 
          fullWidth 
          variant="contained" 
          color="primary" 
          sx={{ mt: 3 }} 
          onClick={handleSubmit}
        >
          Submit Request
        </Button>
      </Box>
    </Modal>
  );
};

export default DonationRequestModal;