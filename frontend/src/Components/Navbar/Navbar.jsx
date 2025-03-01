import React, { useState, useContext } from 'react';
import logo from '../../Assets/logo1.png';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { UserContext } from '../../userContext'; // Assuming you have a UserContext for auth

function Navbar() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext); // Get user data from context
console.log(user)
    const handleProfileClick = () => {
        if (user) {
            navigate('/profile'); // Redirect to profile page if logged in
        }
    };

    return (
        <div>
            <nav className="bg-gray-900 sticky top-0 z-20 border-gray-200">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4">
                    <div className="flex justify-center align-middle text-center -ml-20">
                        <div className="flex align-middle my-auto"><Sidebar /></div>
                        <a href="/" className="flex items-center space-x-3 -ml-18">
                            <div className="flex items-center justify-center">
                                <img className="h-32 w-56 mx-2" src={logo} alt="Logo" />
                            </div>
                        </a>
                    </div>
                    <div className="">
                        <h1 className="font-bold text-white text-xl">{user?.collegeName}</h1>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div
                                className="relative cursor-pointer"
                                onClick={handleProfileClick}
                                title="Go to Profile"
                            >
                                <img
                                     src={`http://localhost:8080/api/v1/auth/uploadss/${user?.profileImageUrl}`}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full border-2 border-white"
                                />
                            </div>
                        ) : (
                            <Link
                                to="/LogIn"
                                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden font-medium rounded-xl hover:bg-green-500 group-hover:bg-green-500 focus:outline-none"
                            >
                                <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-white rounded-xl group-hover:bg-opacity-0">
                                    Log in
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;
