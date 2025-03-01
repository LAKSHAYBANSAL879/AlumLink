import { GoogleLogin } from '@react-oauth/google';
import logo from "../../Assets/logo1.png";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { useContext, useState } from 'react';
import { UserContext } from '../../userContext';
import {toast} from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'

export default function Example() {
  const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate=useNavigate();
  
  const handleGoogleSuccess = async(credentialResponse) => {
    console.log('Credential Response:', credentialResponse);
    
    if (credentialResponse && credentialResponse.credential) {
      
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Decoded Response:", decoded);
      
      
      const { name, email, picture } = decoded;
      // alert(`Welcome ${name}!`);
      console.log("User Details:", { name, email, picture });
      try {
        // Send user data to the backend to check if they exist
        const response = await axios.post('http://localhost:8080/api/v1/auth/googleLogin', {
            email
        });

       
        const { token, user } = response.data;
        setUser(user);
        Cookies.set('token', token, { expires: 7 });
        toast.success('Google Login successful');
        navigate('/');
    } catch (error) {
        console.error("Google login failed:", error);
        toast.error('Google login failed, try again');
    }

    } else {
      alert("Login failed. Try again!");
    }
  };

  const handleGoogleFailure = () => {
    console.error("Google Login Failed");
    alert("Google login failed. Please try again.");
  };
  
  const loginUser = async (ev) => {
      ev.preventDefault();

  try {
    
   const response= await axios.post('http://localhost:8080/api/v1/auth/signin', {
           
      email,
      password,
          });
          
          toast.success('User Login successfull');
    setUser(response.data.user)
    navigate('/');
    const token=response.data.token;
    Cookies.set('token', token, { expires: 7 });
    console.log(token);
  
  } catch (error) {
    
    toast.error('Error Login user:', error);
  }
};
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-8 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="AlumLink"
            src={logo}
            className="mx-auto h-auto w-36"
          />
          <h2 className="text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="http://localhost:8080/api/v1/auth/signin" onSubmit={loginUser} method="POST" className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="text-left block text-sm/6 font-medium text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={ev => setEmail(ev.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Password
                </label>
                <div className="text-sm">
                  <a
                    href="/forgot"
                    className="font-semibold text-green-600 hover:text-green-500"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={ev => setPassword(ev.target.value)}
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>
<p className='text-gray-700 my-3'>OR</p>
          <div className="">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
            />
          </div>

          <p className="mt-4 text-center text-sm/6 text-gray-500">
            Not a member?{' '}
            <a
              href="/signup"
              className="font-semibold text-green-600 hover:text-green-500"
            >
              Signup
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
