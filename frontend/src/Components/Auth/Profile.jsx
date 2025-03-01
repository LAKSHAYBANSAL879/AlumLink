import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../userContext';
import { Card, CardContent, Typography, Button, TextField, Avatar, Grid, Box } from '@mui/material';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfilePage = () => {
  const { user, setUser } = useContext(UserContext);
  const [profileImage, setProfileImage] = useState(null);
  const [editing, setEditing] = useState(false);
  const history = useNavigate();

  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    profileImageUrl: '',
    role: '',
    workingOrganisation: '',
    position: '',
    branch: '',
    currentSemester: 1,
    collegeName: '',
    mobileNumber:''
  });

  useEffect(() => {
    if (user) {
      setUserDetails({
        name: user.name || '',
        email: user.email || '',
        profileImageUrl: user.profileImageUrl || '',
        role: user.role || '',
        workingOrganisation: user.workingOrganisation || '',
        position: user.position || '',
        branch: user.branch || '',
        semester: user.cuurentSemester || '',
        collegeName: user.collegeName || '',
        mobileNumber:user.mobileNumber || '',
      });
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    Cookies.remove("token");
    history("/login");
  };

  const handleUpdateProfile = async () => {
    try {
      const token = Cookies.get("token");
      const formData = new FormData();

      formData.append('name', userDetails.name);
      formData.append('workingOrganisation', userDetails.workingOrganisation);
      formData.append('position', userDetails.position);
      formData.append('branch', userDetails.branch);
      formData.append('semester', userDetails.semester);

      if (profileImage) {
        formData.append("profileImageUrl", profileImage);
      }

      const response = await axios.put(
        "http://localhost:8080/api/v1/auth/update",
        formData,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      toast.success("User information updated successfully");
      setUser(response.data.data.user);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardContent className="p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar
                  src={`http://localhost:8080/api/v1/auth/uploadss/${user?.profileImageUrl}`}
                  alt={userDetails.name}
                  sx={{ width: 120, height: 120 }}
                  className="border-4 border-white shadow-lg"
                />
                {editing && (
                  <label className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow cursor-pointer hover:bg-gray-50">
                    <FontAwesomeIcon icon={faEdit} className="text-gray-600 text-sm" />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setProfileImage(e.target.files[0])}
                    />
                  </label>
                )}
              </div>
              <div className="text-center md:text-left">
                <Typography variant="h4" className="font-bold text-gray-800">
                  {userDetails.name}
                </Typography>
                <Typography variant="subtitle1" className="text-gray-600 capitalize">
                  {userDetails.role}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  {userDetails.collegeName}
                </Typography>
              </div>
            </div>
            <Button
              variant={editing ? "outlined" : "contained"}
              color={editing ? "error" : "success"}
              onClick={() => setEditing(!editing)}
              className="mt-4 md:mt-0"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {/* Main Content */}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h6" className="font-semibold mb-4 text-gray-800">
                Basic Information
              </Typography>
              <Grid container spacing={3}>
              <Grid item xs={12}>
  <div className="flex flex-col md:flex-row gap-4">
    <Box className="flex-1 p-4 bg-gray-50 rounded-lg">
      <Typography variant="subtitle2" className="text-gray-600">
        Email
      </Typography>
      <Typography variant="body1" className="font-medium mt-1">
        {userDetails.email || 'Not specified'}
      </Typography>
    </Box>
    <Box className="flex-1 p-4 bg-gray-50 rounded-lg">
      <Typography variant="subtitle2" className="text-gray-600">
        Phone Number
      </Typography>
      <Typography variant="body1" className="font-medium mt-1">
        {userDetails.mobileNumber || 'Not specified'}
      </Typography>
    </Box>
  </div>
</Grid>
                {editing && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={userDetails.name}
                      onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                      variant="outlined"
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" className="font-semibold mb-4 text-gray-800">
                {userDetails.role === 'alumini' ? 'Professional Details' : 'Academic Details'}
              </Typography>
              {userDetails.role === 'alumini' ? (
                <Grid container spacing={3}>
                  {editing ? (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Working Organization"
                          value={userDetails.workingOrganisation}
                          onChange={(e) => setUserDetails({ ...userDetails, workingOrganisation: e.target.value })}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Position"
                          value={userDetails.position}
                          onChange={(e) => setUserDetails({ ...userDetails, position: e.target.value })}
                          variant="outlined"
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12} md={6}>
                        <Box className="p-4 bg-gray-50 rounded-lg">
                          <Typography variant="subtitle2" className="text-gray-600">
                            Working Organization
                          </Typography>
                          <Typography variant="body1" className="font-medium mt-1">
                            {userDetails.workingOrganisation || 'Not specified'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box className="p-4 bg-gray-50 rounded-lg">
                          <Typography variant="subtitle2" className="text-gray-600">
                            Position
                          </Typography>
                          <Typography variant="body1" className="font-medium mt-1">
                            {userDetails.position || 'Not specified'}
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  {editing ? (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Branch"
                          value={userDetails.branch}
                          onChange={(e) => setUserDetails({ ...userDetails, branch: e.target.value })}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Semester"
                          value={userDetails.currentSemester}
                          onChange={(e) => setUserDetails({ ...userDetails, currentSemester: e.target.value })}
                          variant="outlined"
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12} md={6}>
                        <Box className="p-4 bg-gray-50 rounded-lg">
                          <Typography variant="subtitle2" className="text-gray-600">
                            Branch
                          </Typography>
                          <Typography variant="body1" className="font-medium mt-1">
                            {userDetails.branch || 'Not specified'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box className="p-4 bg-gray-50 rounded-lg">
                          <Typography variant="subtitle2" className="text-gray-600">
                            Semester
                          </Typography>
                          <Typography variant="body1" className="font-medium mt-1">
                            {userDetails.currentSemester || 'Not specified'}
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {editing && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateProfile}
                className="px-6"
              >
                Save Changes
              </Button>
            )}
            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
              className="ml-auto"
              startIcon={<FontAwesomeIcon icon={faSignOutAlt} />}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;