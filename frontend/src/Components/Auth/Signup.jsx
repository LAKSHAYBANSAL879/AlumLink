import { Avatar, FormControl, IconButton, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { Box } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import alumni from "../../Assets/graduated_543741.png";
import student from "../../Assets/reading_3749948.png";
import admin from "../../Assets/software-engineer_6056896.png";

function SignUp() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setPhone] = useState("");
  const [enrollmentNumber, setEnrollment] = useState("");
  const [collegeName, setCollege] = useState("");
  const [workingOrganisation, setWorkingOrganisation] = useState("");
  const [position, setPosition] = useState("");
  const [role,setRole]=useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [yearOfPassout, setYearPass] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImageUrl, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("https://via.placeholder.com/150");
  const [error, setError] = useState("");
  const [collegeOptions, setCollegeOptions] = useState([]);

  useEffect(() => {
    const fetchCollegeNames = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/v1/auth/clgNames");
        if (response.data.success) {
          setCollegeOptions(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };
  
    fetchCollegeNames();
  }, []);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    checkPasswordMatch(e.target.value);
  };

  const checkPasswordMatch = (confirmPass) => {
    if (password !== confirmPass) {
      setError('Passwords do not match');
    } else {
      setError('');
    }
  };
  const registerUser = async (ev) => {
    ev.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const role = yearOfPassout <= currentYear ? 'alumini' : 'student';
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("mobileNumber", mobileNumber);
      formData.append("enrollmentNumber", enrollmentNumber);
      formData.append("yearOfPassout", yearOfPassout);
      formData.append("collegeName", collegeName);
      formData.append("role",role);
      formData.append("workingOrganisation",workingOrganisation);
      formData.append("position",position);
      formData.append("branch",branch);
      formData.append("currentSemester",semester);




      if (profileImageUrl) {
        formData.append("profileImageUrl", profileImageUrl);
      }


    await axios.post("http://localhost:8080/api/v1/auth/register", formData);
     navigate("/login");
    } catch (error) {
      console.error("Error registering user:", error);
      setError("Registration failed. Please try again.");
    }
  };

  const handleImageChange = (ev) => {
    const file = ev.target.files[0];
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };
  const renderAdditionalFields = () => {
    if (yearOfPassout <= currentYear) {
      return (
        <>
          <div className="col-span-6 sm:col-span-3">
            <TextField variant="outlined" label="Working Organization" color="success"
            className='w-full'
              name="alumniOrganization"
              type="text"
              placeholder=""
              value={workingOrganisation}
              onChange={(ev) => setWorkingOrganisation(ev.target.value)}
              required
            />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <TextField variant="outlined" label="Role" color="success"
            className='w-full'
              name="alumniRole"
              type="text"
              placeholder=""
              value={position}
              onChange={(ev) => setPosition(ev.target.value)}
              required
            />
          </div>
        </>
      );
    } else if (yearOfPassout >= currentYear) {
      return (
        <>
          <div className="col-span-6 sm:col-span-3">
            <TextField variant="outlined" label="Current Semester" color="success"
            className='w-full'
              name="semester"
              type="number"
              value={semester}
              onChange={(ev) => setSemester(ev.target.value)}
              placeholder=""
              required
            />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <TextField variant="outlined" label="Student Brnach" color="success"
            className='w-full'
              name="branch"
              type="text"
              value={branch}
              onChange={(ev) => setBranch(ev.target.value)}
              placeholder=""
              required
            />
          </div>
        </>
      );
    }
    return null;
  };
const renderImages=()=>{
    if(yearOfPassout<=currentYear && yearOfPassout!=1){
        return (
            <div className='flex mx-auto justify-center'>
             <img src={alumni} className='w-1/3 absolute top-20  z-1 right-24 opacity-80' alt='cinemaPng' />
          </div>
        )
    }
    else if(yearOfPassout==1){
        return (
            <div className=''>
             <img src={admin} className='w-1/3 absolute top-20  z-1 right-24 opacity-80' alt='cinemaPng' /> 
          </div>
        )
    }
    else{
        return (
            <div className='flex left-1/2'>
             <img src={student} className='w-1/3 absolute top-20  z-1 right-24 opacity-80' alt='cinemaPng' />
          </div>
        ) 
    }
}
  return (
    <div className='relative text-black flex justify-start'>
      <div className="shadow-m rounded-lg relative ml-16 max-w-2xl w-full ">
        {step!==2 && <div className="flex items-start justify-between p-2.5">
          <h3 className="text-2xl font-semibold">Register to AlumLink</h3>
        </div>}
        

        <div className="p-3 space-y-6">
          {step === 1 && (
            <form onSubmit={registerUser} encType="multipart/form-data">
              <div className="grid grid-cols-6 gap-5">
                <Box display="flex" justifyContent="center" mb={2} ml={36} position="relative">
                  <Avatar alt="Profile Preview" src={imagePreview} sx={{ width: 120, height: 120 }} />
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="icon-button-file"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="icon-button-file">
                    <IconButton color="primary" aria-label="upload picture" component="span" sx={{ position: 'absolute', top: 84, left: 20, color: "gray" }}>
                      <PhotoCamera />
                    </IconButton>
                  </label>
                </Box>

                
                <div className="col-span-6 mb-2">
                  <div className="relative w-full min-w-[200px] h-10">
                    <TextField variant="outlined" label="Full Name" color="success"
                      className='w-full'
                      placeholder=" "
                      name="name"
                      type="text"
                      value={name}
                      onChange={(ev) => setName(ev.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

               
                <div className="col-span-6 sm:col-span-2">
                <FormControl fullWidth>
        <InputLabel id="demo-simple-select-helper-label"color='success'>
          College Name
        </InputLabel>
        <Select
        variant='outlined'
          color="success"
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          label="College Name"
          value={collegeName}
          onChange={(ev) => setCollege(ev.target.value)}
          autoComplete="collegeName"
          required
          className="w-full text-black"
        >
          {collegeOptions.map((college, index) => (
            <MenuItem key={index} value={college}>
              {college}
            </MenuItem>
          ))}
          <MenuItem value={'other'}>Other</MenuItem>
        </Select>
      </FormControl>
                </div>
                <div class="col-span-6 sm:col-span-2">
                  <div class="relative w-full min-w-[200px] h-10">
                    < TextField variant="outlined" label="Passout Year" color="success"  
                      placeholder=" "
                      id="yearOfPassout"
                      name="yearOfPassout"
                      type="number"
                      value={yearOfPassout}
                      onChange={(ev) => setYearPass(ev.target.value)}
                      autoComplete="yearPass" required />
                    
                  </div>
                </div>
                <div class="col-span-6 sm:col-span-2">
                  <div class="relative w-full min-w-[200px] h-10">
                    <TextField variant="outlined" label="Enrollment Number" color="success"
                      
                      placeholder=" " id="enrollment"
                      name="enrollmentNumber"
                      type="text"
                      value={enrollmentNumber}
                      onChange={(ev) => setEnrollment(ev.target.value)}
                      autoComplete="enrollment" required />
                   
                  </div>
                </div>

                
                <div className="col-span-6 my-2">
                  <div className="relative w-full min-w-[200px] h-10">
                    <TextField variant="outlined" label="Email" color="success"
                      className='w-full'
                      placeholder=" "
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                      autoComplete="email"
                      required
                    />
                  
                  </div>
                </div>

                
                <div className="col-span-6 my-2">
                  <div className="relative w-full min-w-[200px] h-10">
                    <TextField variant="outlined" label="Mobile Number" color="success"
                      className='w-full'
                      name="mobileNumber"
                      type="number"
                      value={mobileNumber}
                      onChange={(ev) => setPhone(ev.target.value)}
                      autoComplete="phone"
                      required
                    />
                   
                  </div>
                </div>
{renderAdditionalFields()}
                
                <div className="col-span-6 sm:col-span-3 my-2">
                  <div className="relative w-full min-w-[200px] h-10">
                    <TextField variant="outlined" label="Password" color="success"
                      className='w-full'
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                      required
                    />
                    
                  </div>
                </div>

                
                <div className="col-span-6 sm:col-span-3 my-2">
                  <div className="relative w-full min-w-[200px] h-10">
                    <TextField variant="outlined" label="Confirm Password" color="success"
                      className='w-full'
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      autoComplete="new-password"
                      required
                    />
                    
                  </div>
                </div>

                
                {error && <p className="text-red-500 text-sm w-48 -left-32">{error}</p>}

                
                <div className="col-span-6">
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-500 text-white border focus:ring-4 focus:outline-none border-black rounded-lg text-sm font-medium px-5 py-2.5 text-center"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
              <p className="ext-sm mt-5 font-normal text-gray-800 ">
                Already have an account? <Link to="/LogIn" className="font-medium text-green-600">Login here</Link>
              </p>
            </form>
          )}
        </div>
      </div>
      <div className='flex'>
       {renderImages()}
      </div>
    </div>
  );
}

export default SignUp;
