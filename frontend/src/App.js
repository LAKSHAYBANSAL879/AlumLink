import logo from './logo.svg';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { Route, Routes } from 'react-router-dom';
import Signup from './Components/Auth/Signup';
import Login from './Components/Auth/Login';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from "./Components/Home/Home"
import { UserContextProvider } from './userContext';
import ProfilePage from './Components/Auth/Profile';
import ForgotPassword from './Components/Auth/ForgotPassword';
import JobHome from './Components/JobPortal/JobHome';
import JobDescription from './Components/JobPortal/JobDescription';
import JobApplicantsPage from './Components/JobPortal/JobApplicantsPage';
import DonationPortal from './Components/DonationPortal/DonationPortal';
import DonationHome from './Components/DonationPortal/DonationHome';
import ProgressBarPrac from './Components/DonationPortal/ProgressBarPrac';
import BlogHome from './Components/BlogsPortal/BlogHome';
import BlogIndividual from './Components/BlogsPortal/BlogIndividual';


function App() {
  return (
    <UserContextProvider>
<GoogleOAuthProvider clientId="87101963486-mo1s5h89e0dahlfiotqubus9qfgs5rpe.apps.googleusercontent.com">
      <div className="App">
        <Navbar />
        <Routes>
        <Route path='/' element={<Home />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/forgot' element={<ForgotPassword />} />
          <Route path='/jobPortal' element={<JobHome />} />
          <Route path='/jobDesc/:jobId' element={<JobDescription />} />
          <Route path='/job-applications/:jobId' element={<JobApplicantsPage />} />
          <Route path='/donationPortal' element={<DonationHome />} />
          <Route path='/blogs' element={<BlogHome />} />
          <Route path='/blogIndi/:blogId' element={<BlogIndividual/>} />

        </Routes>
      </div>
    </GoogleOAuthProvider>

    </UserContextProvider>
    
  );
}

export default App;
