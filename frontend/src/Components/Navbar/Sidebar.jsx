import React, { useState } from 'react';
import { Drawer, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faCalendar, faEnvelope, faBriefcase, faNewspaper, faHandHoldingDollar, faComment } from '@fortawesome/free-solid-svg-icons';
import logo from "../../Assets/logo1.png";
import { Link } from 'react-router-dom';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsOpen(open);
  };

  return (
    <div>
      
      <IconButton onClick={toggleDrawer(true)}>
        <MenuIcon className="text-white" />
      </IconButton>

     
      <Drawer anchor="left" open={isOpen} onClose={toggleDrawer(false)}>
        <div
          className="bg-gray-900 font-semibold h-full"
          style={{
            width: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '16px',
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          
          <IconButton
            onClick={toggleDrawer(false)}
            style={{
              alignSelf: 'flex-end',
              marginTop: 0,
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>

          
          <div
            style={{
              alignSelf: 'center',
              marginBottom: '16px',
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                width: '240px',
                height: 'auto',
              }}
            />
          </div>

          
          <List style={{ width: '100%' }} className='pl-10'>
            <Link to='/jobPortal'>
            <ListItem button className="cursor-pointer" style={{ padding: '16px 0' }}>
              <FontAwesomeIcon icon={faBriefcase} className="text-white mr-3" />
              <ListItemText
                primary={
                  <Typography
                    style={{
                      fontSize: '20px',
                      fontWeight: 500,
                      color: 'white',
                      fontFamily: 'sans-serif',
                    }}
                  >
                    Job Portal
                  </Typography>
                }
              />
            </ListItem>
            </Link>
            
<Link to='/blogs'>
<ListItem button className="cursor-pointer" style={{ padding: '16px 0' }}>
              <FontAwesomeIcon icon={faNewspaper} className="text-white mr-3" />
              <ListItemText
                primary={
                  <Typography
                    style={{
                      fontSize: '20px',
                      fontWeight: 500,
                      color: 'white',
                      fontFamily: 'sans-serif',
                    }}
                  >
                   Blogs
                  </Typography>
                }
              />
            </ListItem>
</Link>
            
<Link to='/donationPortal'>
<ListItem button className="cursor-pointer" style={{ padding: '16px 0' }}>
              <FontAwesomeIcon icon={faHandHoldingDollar} className="text-white mr-3" />
              <ListItemText
                primary={
                  <Typography
                    style={{
                      fontSize: '20px',
                      fontWeight: 500,
                      color: 'white',
                      fontFamily: 'sans-serif',
                    }}
                  >
                    Donation Portal
                  </Typography>
                }
              />
            </ListItem>
</Link>
           
<Link to='/connect'>
<ListItem button className="cursor-pointer" style={{ padding: '16px 0' }}>
              <FontAwesomeIcon icon={faComment} className="text-white mr-3" />
              <ListItemText
                primary={
                  <Typography
                    style={{
                      fontSize: '20px',
                      fontWeight: 500,
                      color: 'white',
                      fontFamily: 'sans-serif',
                    }}
                  >
                    Connect
                  </Typography>
                }
              />
            </ListItem>
</Link>
<Link to='/contact'>
<ListItem button className="cursor-pointer" style={{ padding: '16px 0' }}>
              <FontAwesomeIcon icon={faEnvelope} className="text-white mr-3" />
              <ListItemText
                primary={
                  <Typography
                    style={{
                      fontSize: '20px',
                      fontWeight: 500,
                      color: 'white',
                      fontFamily: 'sans-serif',
                    }}
                  >
                    Contact Us
                  </Typography>
                }
              />
            </ListItem>
</Link>
            
          </List>
        </div>
      </Drawer>
    </div>
  );
};

export default Sidebar;
