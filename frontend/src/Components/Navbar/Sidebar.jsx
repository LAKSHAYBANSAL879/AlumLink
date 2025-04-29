import React, { useState, useEffect } from 'react';
import { Drawer, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faCalendar, faEnvelope, faBriefcase, faNewspaper, faHandHoldingDollar, faComment } from '@fortawesome/free-solid-svg-icons';
import logo from "../../Assets/logo1.png";
import { Link } from 'react-router-dom';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(300); 

 
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) { 
        setDrawerWidth(260);
      } else {
        setDrawerWidth(300);
      }
    };

   
    handleResize();

   
    window.addEventListener('resize', handleResize);
    
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDrawer = (open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsOpen(open);
  };

  
  const menuItems = [
    { icon: faBriefcase, text: "Job Portal", link: "/jobPortal" },
    { icon: faNewspaper, text: "Blogs", link: "/blogs" },
    { icon: faHandHoldingDollar, text: "Donation Portal", link: "/donationPortal" },
    { icon: faComment, text: "Connect", link: "/chatPortal" },
    { icon: faEnvelope, text: "Contact Us", link: "/contact" }
  ];

  return (
    <div>
      <IconButton 
        onClick={toggleDrawer(true)} 
        aria-label="Menu"
        className="p-1 sm:p-2"
      >
        <MenuIcon className="text-white h-5 w-5 sm:h-6 sm:w-6" />
      </IconButton>

      <Drawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: drawerWidth,
          }
        }}
      >
        <div
          className="bg-gray-900 font-semibold h-full flex flex-col items-flex-start p-4"
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          {/* Close button */}
          <IconButton
            onClick={toggleDrawer(false)}
            className="self-end mt-0 text-white"
            aria-label="Close menu"
          >
            <CloseIcon className='text-white'/>
          </IconButton>

          {/* Logo */}
          <div className="self-center mb-4 px-2">
            <img
              src={logo}
              alt="Logo"
              className="w-full max-w-[200px] sm:max-w-[240px] h-auto"
            />
          </div>

          {/* Menu Items */}
          <List className="w-full pl-0 sm:pl-8">
            {menuItems.map((item, index) => (
              <Link to={item.link} key={index}>
                <ListItem 
                  button 
                  className="cursor-pointer py-3 sm:py-4 px-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={item.icon} className="text-white mr-3 w-5 h-5" />
                  <ListItemText
                    primary={
                      <Typography
                        style={{
                          fontSize: '20px',
                          fontWeight: 500,
                          color: 'white',
                          fontFamily: 'sans-serif',
                        }}
                        className="text-base sm:text-lg md:text-2=xl lg:text-3xl"
                      >
                        {item.text}
                      </Typography>
                    }
                  />
                </ListItem>
              </Link>
            ))}
          </List>
          
          
          <div className="mt-auto pt-4 pb-2 text-center text-white text-xs opacity-70">
            <p>© 2025 AlumLink</p>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Sidebar;