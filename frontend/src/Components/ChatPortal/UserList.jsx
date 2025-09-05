import React, { useContext, useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Avatar, Badge, Paper, List, ListItem, 
  ListItemAvatar, ListItemText, InputAdornment, Button
} from '@mui/material';
import { Search } from 'lucide-react';
import { ChatContext } from './ChatContext';
import { UserContext } from '../../userContext';

const UserList = () => {
  const { allUsers, contacts, selectedChat, handleChatSelect, startNewChat } = useContext(ChatContext);
  const { user } = useContext(UserContext);
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Filter out admin users and the current logged-in user
  useEffect(() => {
    if (Array.isArray(allUsers) && user) {
      const filtered = allUsers.filter(u => 
        u._id !== user._id && u.role !== 'admin'
      );
      setFilteredUsers(filtered);
    } else {
      console.error('allUsers is not an array:', allUsers);  // Debugging line
    }
  }, [user,allUsers]);
  

  return (
    <Paper sx={{ 
      width: 320, 
      display: 'flex', 
      flexDirection: 'column', 
      borderRadius: 0,
      overflow: 'hidden'
    }}>
      {/* User profile header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        bgcolor: '#f8f8f8',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Avatar src={`http://localhost:8080/api/v1/auth/uploadss/${user?.profileImageUrl}`} />
        <Box sx={{ ml: 2, flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">{user?.name || 'User'}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.email || 'Loading...'}</Typography>
        </Box>
        <Typography variant="caption" sx={{ 
          bgcolor: '#e9f5e9', 
          color: '#4caf50', 
          px: 1, 
          py: 0.5, 
          borderRadius: 1, 
          fontSize: '0.7rem' 
        }}>
          {user?.role || 'user'}
        </Typography>
      </Box>
      
      {/* Search bar */}
      <Box sx={{ p: 2, pb: 1 }}>
        <TextField
          fullWidth
          placeholder="Search message"
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            )
          }}
          sx={{ 
            bgcolor: '#f1f1f1', 
            '& .MuiOutlinedInput-root': { 
              borderRadius: 2 
            } 
          }}
        />
      </Box>
      
      {/* Chat categories */}
      <Box sx={{ px: 2, pb: 1, display: 'flex' }}>
        <Button 
          variant="contained" 
          size="small" 
          sx={{ 
            mr: 1, 
            bgcolor: '#4caf50', 
            '&:hover': { bgcolor: '#388e3c' },
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 'normal',
            fontSize: '0.75rem'
          }}
        >
          Recent
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          sx={{ 
            color: '#9e9e9e', 
            borderColor: '#e0e0e0',
            '&:hover': { borderColor: '#9e9e9e', bgcolor: '#f5f5f5' },
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 'normal',
            fontSize: '0.75rem'
          }}
        >
          Unread
        </Button>
      </Box>
      
      {/* Chat list - with its own scrollbar */}
      <List sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        pb: 0,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#bdbdbd',
          borderRadius: '3px',
        }
      }}>
        {/* Section header for chats with messages */}
        <ListItem sx={{ pt: 1, pb: 0 }}>
          <Typography variant="caption" color="text.secondary" fontWeight="medium">
            CONVERSATIONS
          </Typography>
        </ListItem>
        
        {contacts && contacts.filter(contact => contact._id && contact.messages.length > 0).map((contact) => (
          <ListItem 
            key={contact._id}
            button="true" 
            onClick={() => handleChatSelect(contact._id)}
            selected={selectedChat?._id === contact._id}
            sx={{ 
              py: 1.5,
              borderLeft: selectedChat?._id === contact._id ? '4px solid #4caf50' : '4px solid transparent',
              bgcolor: selectedChat?._id === contact._id ? '#f0f7ff' : 'transparent',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color={contact.online ? "success" : "error"}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: contact.online ? '#44b700' : '#ff5252',
                    boxShadow: `0 0 0 2px white`,
                    '&::after': {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      animation: contact.online ? 'ripple 1.2s infinite ease-in-out' : 'none',
                      border: '1px solid currentColor',
                      content: '""',
                    },
                  },
                  '@keyframes ripple': {
                    '0%': {
                      transform: 'scale(.8)',
                      opacity: 1,
                    },
                    '100%': {
                      transform: 'scale(2.4)',
                      opacity: 0,
                    },
                  },
                }}
              >
                 <Avatar src={`http://localhost:8080/api/v1/auth/uploadss/${contact?.profileImageUrl}`} alt={contact?.name}/>
              </Badge>
            </ListItemAvatar>
            <ListItemText 
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" noWrap sx={{ maxWidth: 150, fontWeight: contact.unreadCount > 0 ? 'bold' : 'regular' }}>
                    {contact.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {contact.lastMessageTime}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 170 }}>
                    {contact.lastMessage}
                  </Typography>
                  {contact.unreadCount > 0 && (
                    <Badge badgeContent={contact.unreadCount} color="error" sx={{ ml: 1 }} />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
        
      
        <ListItem sx={{ pt: 2, pb: 0 }}>
          <Typography variant="caption" color="text.secondary" fontWeight="medium">
            NEW MESSAGES
          </Typography>
        </ListItem>
        
        {filteredUsers && filteredUsers.map((user) => {
          // Check if this user is already in contacts
          const isExistingContact = contacts?.some(contact => 
            contact._id === user._id && contact.messages && contact.messages.length > 0
          );
          if (isExistingContact) return null;
          
          return (
            <ListItem 
              key={user._id}
              button 
              onClick={() => startNewChat(user._id)}
              selected={selectedChat?._id === user._id}
              sx={{ 
                py: 1.5,
                borderLeft: selectedChat?._id === user._id ? '4px solid #4caf50' : '4px solid transparent',
                bgcolor: selectedChat?._id === user._id ? '#f0f7ff' : 'transparent',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  color={user.online ? "success" : "error"}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: user.online ? '#44b700' : '#ff5252',
                      boxShadow: `0 0 0 2px white`,
                    },
                  }}
                >
                  <Avatar src={`http://localhost:8080/api/v1/auth/uploadss/${user?.profileImageUrl}`} alt={user?.name}/>
                </Badge>
              </ListItemAvatar>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" noWrap sx={{ maxWidth: 150 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      bgcolor: '#e3f2fd', 
                      color: '#2196f3', 
                      px: 1, 
                      py: 0.2, 
                      borderRadius: 1, 
                      fontSize: '0.7rem' 
                    }}>
                      New
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 170 }}>
                    {user.email || 'Start a conversation'}
                  </Typography>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

export default UserList;