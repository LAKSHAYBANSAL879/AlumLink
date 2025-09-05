import React, { useState, useContext, useEffect, useRef } from 'react';
import logo from '../../Assets/logo1.png';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { UserContext } from '../../userContext';
import io from 'socket.io-client';
import { Bell } from 'lucide-react';

const DEFAULT_USER = 'https://img.icons8.com/?size=100&id=13042&format=png&color=000000';

function Navbar() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext); 
    
    // Notification states
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const handleProfileClick = () => {
        if (user) {
            navigate('/profile'); // Redirect to profile page if logged in
        }
    };
    
   
    useEffect(() => {
        if (!user || !user._id) return;
        
        // Setup socket connection
        const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:8080');
        
        // Authenticate with socket
        socket.emit('authenticate', user._id);
        
        // Listen for new notifications
        socket.on('new_notification', (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show browser notification if available
            if (Notification.permission === 'granted') {
                new Notification('New Notification', {
                    body: getNotificationContent(newNotification)
                });
            }
        });
        
        // Clean up socket connection
        return () => {
            socket.disconnect();
        };
    }, [user]);
    
    // Fetch notifications on mount
    useEffect(() => {
        if (!user || !user._id) return;
        fetchNotifications();
    }, [user]);
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const fetchNotifications = async () => {
        const userId = user?._id;
        try {
            const response = await fetch(`http://localhost:8080/api/v1/notification/${userId}?limit=7`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setNotifications(data.data.notifications);
                setUnreadCount(data.data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };
    
    const markAsRead = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/notification/${id}/read`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                setNotifications(notifications.map(notification => 
                    notification._id === id 
                        ? { ...notification, isRead: true } 
                        : notification
                ));
                
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };
    
    const markAllAsRead = async () => {
        const userId = user?._id;
        try {
            const response = await fetch(`http://localhost:8080/api/v1/notification/${userId}/read-all`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };
    
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const getBlogCoverPhotoUrl = (profileImageUrl) => {
        if (!profileImageUrl) return DEFAULT_USER;
        if (profileImageUrl.startsWith('http://') || profileImageUrl.startsWith('https://')) {
            return profileImageUrl;
        }
        return `http://localhost:8080/api/v1/auth/uploadss/${profileImageUrl}`;
    };
    
    const getNotificationContent = (notification) => {
        switch(notification.type) {
            case 'donation':
                return `${notification.message}  "${notification.title}"`;
            case 'job':
                return `New application for "${notification.title}" job posting`;
            case 'application':
                return `${notification.message} ${notification.title}`;
            case 'blog':
                return `${notification.message} "${notification.title}"`;
            case 'chat':
                return `New message from ${notification.sourceName}`;
            default:
                return notification.message || 'New notification';
        }
    };
    
    const getNotificationIcon = (type) => {
        switch(type) {
            case 'donation':
                return '💰';
            case 'job':
                return '💼';
            case 'application':
                return '📝';
            case 'blog':
                return '📰';
            case 'chat':
                return '💬';
            default:
                return '🔔';
        }
    };
    
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / 60000);
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    };
    
    const handleNotificationClick = (notification) => {
        markAsRead(notification._id);
        
        // Navigate based on notification type
        switch(notification.type) {
            case 'donation':
                navigate(`/donationPortal`);
                break;
            case 'job':
                navigate(`/jobPortal`);
                break;
            case 'blog':
                navigate(`/blogPortal`);
                break;
            case 'chat':
                navigate(`/chatPortal`);
                break;
            default:
                setIsOpen(false);
        }
    };
    
    return (
        <div>
            <nav className="bg-sticky top-0 z-20 border-gray-200" style={{ backgroundColor: '#191919' }}>
                <div className="w-full flex flex-wrap items-center justify-between mx-auto px-4">
                    <div className="flex justify-center align-middle text-center">
                        <div className="flex align-middle my-auto"><Sidebar /></div>
                        <a href="/" className="flex items-center space-x-3">
                            <div className="flex items-center justify-center">
                                <img className="h-16 sm:h-24 md:h-32 w-auto mx-2" src={logo} alt="Logo" />
                            </div>
                        </a>
                    </div>
                    <div className="text-center mb-2 md:mb-0 md:text-left order-3 md:order-2 w-full md:w-auto">
                        <h1 className="font-bold text-white text-lg sm:text-xl">{user?.collegeName}</h1>
                    </div>
                    <div className="flex items-center order-2 md:order-3">
                        {user ? (
                            <>
                                {/* Notification Bell */}
                                <div className="relative mr-2 md:mr-4" ref={dropdownRef}>
                                    <button 
                                        className="relative p-2 text-gray-300 hover:text-white focus:outline-none"
                                        onClick={toggleDropdown}
                                        aria-label="Notifications"
                                    >
                                        <Bell className="h-5 w-5 md:h-6 md:w-6" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    
                                    {isOpen && (
                                        <div className="absolute right-0 mt-2 w-64 sm:w-72 md:w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
                                            <div className="py-2 px-3 bg-gray-100 flex justify-between items-center">
                                                <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button 
                                                        onClick={markAllAsRead}
                                                        className="text-xs text-blue-600 hover:text-blue-800"
                                                    >
                                                        Mark all as read
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="py-4 px-3 text-center text-gray-500">
                                                        No notifications
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {notifications.map(notification => (
                                                            <div 
                                                                key={notification._id}
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className={`px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                                            >
                                                                <div className="flex items-start">
                                                                    <div className="flex-shrink-0 mr-2 sm:mr-3">
                                                                        <span className="text-base sm:text-lg">{getNotificationIcon(notification.type)}</span>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-xs sm:text-sm text-gray-800">{getNotificationContent(notification)}</p>
                                                                        <p className="text-xs text-gray-500 mt-1">{formatTime(notification.timestamp)}</p>
                                                                    </div>
                                                                    {!notification.isRead && (
                                                                        <div className="flex-shrink-0 ml-2">
                                                                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="py-2 px-3 bg-gray-100 text-center">
                                                <button 
                                                    onClick={() => navigate('/notifications')}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    View all notifications
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Profile Image */}
                                <div
                                    className="relative cursor-pointer"
                                    onClick={handleProfileClick}
                                    title="Go to Profile"
                                >
                                    <img
                                        src={getBlogCoverPhotoUrl(user?.profileImageUrl)}
                                        alt="Profile"
                                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full border-2 border-white"
                                    />
                                </div>
                            </>
                        ) : (
                            <Link
                                to="/LogIn"
                                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden font-medium rounded-xl hover:bg-green-500 group-hover:bg-green-500 focus:outline-none"
                            >
                                <span className="relative px-3 py-1.5 sm:px-5 sm:py-2 transition-all ease-in duration-75 bg-white rounded-xl group-hover:bg-opacity-0">
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