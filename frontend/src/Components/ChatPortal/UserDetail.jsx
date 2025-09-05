import React, { useContext } from 'react';
import { 
  Box, Typography, Avatar, Badge, IconButton, Paper, Divider, 
  List, ListItem, ListItemAvatar, ListItemText, Tooltip
} from '@mui/material';
import { 
  MoreVertical, Mic, LogOut, FileText, Star, Database, Image, User 
} from 'lucide-react';
import { ChatContext } from './ChatContext';

const UserDetail = () => {
  const { selectedChat } = useContext(ChatContext);

  if (!selectedChat) return null;

  // Dummy data to simulate different user types
  // console.log("selected chat role is ",selectedChat)
  const isStudent = selectedChat.role === 'student'; // Check if user is a student
  const isAlumnus = selectedChat.role === 'alumini'; // Check if user is an alumnus
// console.log("selected chat is alumini",isAlumnus);
  const userDetails = isStudent
  ? `College: ${selectedChat?.collegeName || 'N/A'}\nSemester: ${selectedChat?.currentSemester || 'N/A'}\nBranch: ${selectedChat?.branch || 'N/A'}`
  : isAlumnus
  ? `Company: ${selectedChat?.workingOrganisation || 'N/A'}\nPosition: ${selectedChat?.position || 'N/A'}`
  : "No additional details available";

  return (
    <Paper sx={{ width: 320, display: 'flex', flexDirection: 'column', borderRadius: 0 }}>
      {/* Chat information header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle1" fontWeight="medium">Details</Typography>
        <Typography variant="subtitle1">
          <MoreVertical size={20} />
        </Typography>
      </Box>
      
      {/* Contact profile */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, pb: 3 }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          color={selectedChat.online ? "success" : "error"}
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: selectedChat.online ? '#44b700' : '#ff5252',
              boxShadow: `0 0 0 2px white`,
            },
          }}
        >
          <Avatar 
            alt={selectedChat.name} 
            src={`https://alumlink-ruo3.onrender.com/api/v1/auth/uploadss/${selectedChat?.profileImageUrl}`}
            sx={{ width: 80, height: 80 }}
          />
        </Badge>
        <Typography variant="h6" sx={{ mt: 2 }}>{selectedChat.name}</Typography>
        <Typography variant="body2" color="text.secondary">{selectedChat?.email}</Typography>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', mt: 2, gap: 2 }}>


          {/* Show Details Button */}
          <Tooltip title={<Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>{userDetails}</Typography>}>
            <Paper elevation={0} sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <IconButton size="small" sx={{ mb: 0.5 }}>
                <User size={18} />
              </IconButton>
              <Typography variant="caption">Show Details</Typography>
            </Paper>
          </Tooltip>
        </Box>
      </Box>
      
      <Divider />

      {/* Options list */}
      <List>
        <ListItem button sx={{ py: 2 }}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: '#e3f2fd' }}>
              <FileText size={18} color="#2196f3" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary="Docs, Link, Media" 
            secondary={<Typography variant="caption" sx={{ bgcolor: '#e3f2fd', px: 1, py: 0.2, borderRadius: 1, color: '#2196f3' }}>230</Typography>}
          />
        </ListItem>
        
        <ListItem button sx={{ py: 2 }}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: '#fff8e1' }}>
              <Star size={18} color="#ffc107" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary="Star Message" 
            secondary={<Typography variant="caption" color="text.secondary">Empty</Typography>}
          />
        </ListItem>
        
        <ListItem button sx={{ py: 2 }}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: '#e8f5e9' }}>
              <Database size={18} color="#4caf50" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Storage Settings" />
        </ListItem>
        
        <ListItem button sx={{ py: 2 }}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: '#f3e5f5' }}>
              <Image size={18} color="#9c27b0" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Chat Wallpaper" />
        </ListItem>
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
    </Paper>
  );
};

export default UserDetail;
