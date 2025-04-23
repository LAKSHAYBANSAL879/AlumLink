import React, { useState } from 'react';
import Modal from 'react-modal';
import {
    TextField, Button, Box, Typography, IconButton, CircularProgress, Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

const employmentTypes = ['Full-time', 'Part-time', 'Internship'];
const experienceRequireds = ['Fresher', '0-3 years', '3+ years'];

const JobPostingModal = ({ isOpen, onClose, loggedInUser }) => {
    const initialFormData = {
        title: '',
        category: '',
        location: [], 
        company: '',
        about: '',
        skillsRequired: [], 
        description: '',
        experienceLevel: '',
        applicationDeadline: dayjs(),
        salaryRange: '',
        employmentType: '',
        maxApplicants: 1000,
        companyImageUrl: '',
        postedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        postedBy: loggedInUser?._id,
    };
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [inputLocation, setInputLocation] = useState('');
    const [inputSkill, setInputSkill] = useState('');

    const resetForm = () => {
        setFormData(initialFormData);
        setInputLocation('');
        setInputSkill('');
    }
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleArrayInputChange = (e, field) => {
        e.preventDefault(); 
        
        if (field === 'location') {
            const trimmedLocation = inputLocation.trim();
            if (trimmedLocation && !formData.location.includes(trimmedLocation)) {
                setFormData((prev) => ({
                    ...prev,
                    location: [...prev.location, trimmedLocation],
                }));
                setInputLocation('');
            }
        } else if (field === 'skillsRequired') {
            const trimmedSkill = inputSkill.trim();
            if (trimmedSkill && !formData.skillsRequired.includes(trimmedSkill)) {
                setFormData((prev) => ({
                    ...prev,
                    skillsRequired: [...prev.skillsRequired, trimmedSkill],
                }));
                setInputSkill('');
            }
        }
    };

    const handleChipDelete = (chip, field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((item) => item !== chip),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        
        if (
            !formData.title || 
            !formData.category || 
            !formData.company || 
            !formData.experienceLevel || 
            !formData.applicationDeadline || 
            !formData.employmentType || 
            formData.location.length === 0 || 
            formData.skillsRequired.length === 0
        ) {
            toast.warning("Please fill all required fields. Location and Skills must have at least one value.");
            return;
        }
    
        setLoading(true);
    
        try {
            const response = await fetch("https://alumlink-ruo3.onrender.com/api/v1/jobs/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", 
                },
                body: JSON.stringify(formData),
            });
    
            if (!response.ok) {
                throw new Error("Failed to post job");
            }
    
            const result = await response.json();
            toast.success("Job posted successfully");
            resetForm();
            onClose();
        } catch (error) {
            toast.error("Error posting job");
            alert("Error posting job. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e, field) => {
        
        if (e.key === 'Enter') {
            e.preventDefault();
            handleArrayInputChange(e, field);
        }
    };

    const addItem = (field) => {
        handleArrayInputChange({ preventDefault: () => {} }, field);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Post a Job"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-hidden"
        >
            <IconButton onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <CloseIcon />
            </IconButton>

            <Box display="flex" flexDirection="column" maxHeight="80vh" overflow="auto" padding={2}>
                <Typography variant="h5" className="mb-8 font-bold" sx={{marginBottom:'12px'}}>
                    Post a Job
                </Typography>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <TextField fullWidth label="Job Title" name="title" value={formData.title} onChange={handleInputChange} required />

                    <TextField fullWidth label="Job Category" name="category" value={formData.category} onChange={handleInputChange} required />

                    <TextField fullWidth label="Company Name" name="company" value={formData.company} onChange={handleInputChange} required />
                    <TextField fullWidth label="About Company" name="about" value={formData.about} onChange={handleInputChange} required />
                    <TextField fullWidth label="Maximum Applicants allowed" name="maxApplicants" value={formData.maxApplicants} onChange={handleInputChange} required />
                    <TextField fullWidth label="Company logo URL" name="companyImageUrl" value={formData.companyImageUrl} onChange={handleInputChange} required />

                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                        <TextField
                            fullWidth
                            label="Add Location"
                            value={inputLocation}
                            onChange={(e) => setInputLocation(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, 'location')}
                            placeholder="Type and press Enter to add"
                        />
                        <Button 
                            variant="contained" 
                            onClick={() => addItem('location')}
                            disabled={!inputLocation.trim()}
                        >
                            Add
                        </Button>
                    </Box>
                    
                    <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {formData.location.length > 0 ? (
                            formData.location.map((loc) => (
                                <Chip key={loc} label={loc} onDelete={() => handleChipDelete(loc, 'location')} />
                            ))
                        ) : (
                            <Typography variant="caption" color="text.secondary">
                                No locations added yet. Add at least one location.
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                        <TextField
                            fullWidth
                            label="Add Skills Required"
                            value={inputSkill}
                            onChange={(e) => setInputSkill(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, 'skillsRequired')}
                            placeholder="Type and press Enter to add"
                        />
                        <Button 
                            variant="contained" 
                            onClick={() => addItem('skillsRequired')}
                            disabled={!inputSkill.trim()}
                        >
                            Add
                        </Button>
                    </Box>
                    
                    <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {formData.skillsRequired.length > 0 ? (
                            formData.skillsRequired.map((skill) => (
                                <Chip key={skill} label={skill} onDelete={() => handleChipDelete(skill, 'skillsRequired')} />
                            ))
                        ) : (
                            <Typography variant="caption" color="text.secondary">
                                No skills added yet. Add at least one skill.
                            </Typography>
                        )}
                    </Box>

                    <TextField
                        fullWidth
                        label="Key Responsibilities"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        multiline
                        rows={3}
                        required
                    />

                    <TextField
                        fullWidth
                        label="Experience Required"
                        name="experienceLevel"
                        select
                        value={formData.experienceLevel}
                        onChange={handleInputChange}
                        SelectProps={{ native: true }}
                        required
                    >
                        <option value="" disabled>Select Experience Required</option>
                        {experienceRequireds.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </TextField>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Application Deadline"
                            value={formData.applicationDeadline}
                            onChange={(date) => setFormData(prev => ({ ...prev, applicationDeadline: date }))}
                            renderInput={(params) => <TextField fullWidth {...params} required />}
                        />
                    </LocalizationProvider>

                    <TextField fullWidth label="Salary Range (e.g., $50k - $70k)" name="salaryRange" value={formData.salaryRange} onChange={handleInputChange} />

                    <TextField
                        fullWidth
                        label="Employment Type"
                        name="employmentType"
                        select
                        value={formData.employmentType}
                        onChange={handleInputChange}
                        SelectProps={{ native: true }}
                        required
                    >
                        <option value="" disabled>Select Employment Type</option>
                        {employmentTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </TextField>

                    <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button onClick={() => { resetForm(); onClose();}} variant="outlined" color="warning">
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Post Job'}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
};

export default JobPostingModal;