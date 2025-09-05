import React, { useState } from 'react'
import logo from "../../Assets/logo1.png";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const ForgotPassword = () => {
      const [email, setEmail] = useState('');
      const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/forgot-password', { email });
            setMessage(response.data.message);
            setStep(2);
        } catch (error) {
            setMessage(error.response.data.message);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/reset-password', { otp, password: newPassword });
            setMessage(response.data.message);
            navigate('/login');
        } catch (error) {
            setMessage(error.response.data.message);
        }
    };
    return(
    <>
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-8 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="AlumLink"
          src={logo}
          className="mx-auto h-auto w-36"
        />
             <h3 className="text-2xl font-semibold">
                        {step === 1 ? 'Forgot Password?' : 'Reset Your Password'}
                    </h3>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      {message && <p className="text-base text-red-500">{message}</p>}
        <form onSubmit={step === 1 ? handleEmailSubmit : handleResetPassword} className="space-y-6">
            {step===1 && (

            
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
        )}
{step===2 && (
    <>
  <div>
  <label
    htmlFor="otp"
    className="text-left block text-sm/6 font-medium text-gray-900"
  >
   OTP
  </label>
  <div className="mt-2">
    <input
      id="otp"
      name="otp"
      type="otp"
      value={otp}
      onChange={ev => setOtp(ev.target.value)}
      required
      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
    />
  </div>
</div>
  <div>
  <label
    htmlFor="password"
    className="text-left block text-sm/6 font-medium text-gray-900"
  >
    New Password
  </label>
  <div className="mt-2">
    <input
      id="password"
      name="newPassword"
      type="password"
      value={newPassword}
      onChange={ev => setNewPassword(ev.target.value)}
      required
      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
    />
  </div>
</div>
</>
)}
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
               {step === 1 ? 'Send OTP' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </>
    );
}

export default ForgotPassword