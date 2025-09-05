import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { 
  Box, Typography, TextField, Avatar, Badge, IconButton, 
  Tooltip, Button, Popover, InputAdornment
} from '@mui/material';
import { 
  ChevronLeft, Phone, Video, Info, Smile, Paperclip, 
  Send, Mic, X, FileText, Image, Music,
  VideoIcon,
  MicIcon,
  BusIcon,
  MicOffIcon,
  VideoOffIcon,
  PhoneCallIcon
} from 'lucide-react';
import { ChatContext } from './ChatContext';
import EmojiPicker from 'emoji-picker-react';
import MicRecorder from 'mic-recorder-to-mp3';
import { v4 as uuidv4 } from 'uuid';
const DEFAULT_USER='https://img.icons8.com/?size=100&id=13042&format=png&color=000000';

// Initialize mic recorder
const recorder = new MicRecorder({ bitRate: 128 });

// Helper component for message icon in empty state
const Message = ({ size, color }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.9C9.87812 3.30493 11.1801 2.99656 12.5 3H13C15.0843 3.11499 17.053 3.99476 18.5291 5.47086C20.0052 6.94696 20.885 8.91565 21 11V11.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Format date for message groups
const formatMessageDate = (dateString) => {
  const messageDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if date is today
  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  }
  
  // Check if date is yesterday
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  
  // Return formatted date for older messages
  return messageDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Group messages by date
const groupMessagesByDate = (messages) => {
  const groupedMessages = {};
  
  messages.forEach(message => {
    // Use createdDate if available, otherwise fallback to current date
    const messageDate = message.createdAt ? new Date(message.createdAt) : new Date();
    const dateKey = messageDate.toLocaleDateString('en-IN');
    
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = {
        displayDate: formatMessageDate(messageDate),
        messages: []
      };
    }
    
    groupedMessages[dateKey].messages.push(message);
  });
  
  // Convert object to array and sort by date (newest last)
  return Object.values(groupedMessages).sort((a, b) => {
    const dateA = new Date(a.messages[0].createdAt || 0);
    const dateB = new Date(b.messages[0].createdAt || 0);
    return dateA - dateB;
  });
};

// File Attachment Message Component
const FileAttachment = ({ mediaUrls, mediaType }) => {
  if (!mediaUrls || mediaUrls.length === 0) return null;
  
  const url = mediaUrls[0];
  const isImage = mediaType === 'image';
  const isAudio = mediaType === 'audio';
  const isVideo = mediaType === 'video';
  const isFile = mediaType === 'file' || mediaType === 'pdf';
  const fileName = url.split('/').pop();
  const handleFileClick = () => {
    window.open(url, '_blank');
  };
  
  return (
    <Box sx={{ mt: 1 }}>
      {isImage && (
        <Box>
          <img 
            src={url} 
            alt={fileName}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '200px', 
              borderRadius: '4px'
            }}
          />
          <Typography variant="caption" color="inherit" sx={{ display: 'block', mt: 0.5 }}>
            {fileName}
          </Typography>
        </Box>
      )}
      
      {isAudio && (
        <Box>
          <audio controls src={url} style={{ width: '100%', maxWidth: '250px' }} />
          <Typography variant="caption" color="inherit" sx={{ display: 'block', mt: 0.5 }}>
            {fileName}
          </Typography>
        </Box>
      )}
      
      {isVideo && (
        <Box>
          <video 
            controls 
            src={url} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '200px', 
              borderRadius: '4px'
            }}
          />
          <Typography variant="caption" color="inherit" sx={{ display: 'block', mt: 0.5 }}>
            {fileName}
          </Typography>
        </Box>
      )}
       {isFile && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'rgba(0,0,0,0.05)', 
            p: 1.5, 
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.08)',
            }
          }}
          onClick={handleFileClick}
        >
          <FileText size={24} style={{ marginRight: '12px', color: mediaType === 'pdf' ? '#F44336' : '#4285F4' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" fontWeight="medium">{fileName}</Typography>
            <Typography variant="caption" color="text.secondary">
              Click to open {mediaType === 'pdf' ? 'PDF' : 'file'}
            </Typography>
          </Box>
        </Box>
      )}
      {!isImage && !isAudio && !isVideo && !isFile &&  (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: 'rgba(0,0,0,0.05)', 
          p: 1, 
          borderRadius: 1 
        }}>
          <FileText size={20} style={{ marginRight: '8px' }} />
          <Box>
            <Typography variant="body2">{fileName}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const ChatWindow = () => {
  const { 
    selectedChat, 
    setSelectedChat,
    message, 
    setMessage, 
    handleKeyPress,
    handleSendMessage,
    messagesEndRef,
    typingUsers,
    attachments,
    setAttachments,
    callStatus
  } = useContext(ChatContext);


  // State for emoji picker
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const openEmojiPicker = Boolean(emojiAnchorEl);

  // State for file attachment
  const fileInputRef = useRef(null);
  // const [attachments, setAttachments] = useState([]);

  // State for voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  // Handle emoji selection
  const handleEmojiClick = (emojiObj) => {
    setMessage(prev => prev + emojiObj.emoji);
    setEmojiAnchorEl(null);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newAttachments = files.map(file => ({
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        isAudio: file.type.startsWith('audio/')
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  // Handle voice recording
  const startRecording = () => {
    recorder.start()
      .then(() => {
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      })
      .catch(err => console.error('Error starting recording:', err));
  };

  const stopRecording = () => {
    recorder.stop()
      .getMp3()
      .then(([buffer, blob]) => {
        clearInterval(timerRef.current);
        setIsRecording(false);
        
        // Create audio file from blob
        const audioFile = new File(buffer, `voice_message_${Date.now()}.mp3`, {
          type: blob.type,
          lastModified: Date.now()
        });
        
        // Add to attachments
        setAttachments(prev => [...prev, {
          id: uuidv4(),
          name: audioFile.name,
          size: audioFile.size,
          type: audioFile.type,
          file: audioFile,
          isAudio: true
        }]);
      })
      .catch(err => console.error('Error stopping recording:', err));
  };

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Remove attachment
  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Go back to contacts list on mobile
  const handleGoBack = () => {
    setSelectedChat(null);
  };

  // Group messages by date if messages exist
  const groupedMessages = selectedChat?.messages ? 
    groupMessagesByDate(selectedChat.messages) : [];

  // console.log(groupedMessages);  
  return (
    <Box sx={{ 
      flexGrow: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      borderRight: '1px solid #e0e0e0',
      overflow: 'hidden'
    }}>
      {selectedChat ? (
        <>
          {/* Chat header */}
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#fff',
            zIndex: 10 
          }}>
            <IconButton 
              size="small" 
              sx={{ mr: 1, display: { sm: 'flex', md: 'none' } }}
              onClick={handleGoBack}
            >
              <ChevronLeft size={20} />
            </IconButton>
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
                src={selectedChat?.profileImageUrl && selectedChat.profileImageUrl.startsWith('http') 
                  ? selectedChat.profileImageUrl 
                  : `http://localhost:8080/api/v1/auth/uploadss/${selectedChat?.profileImageUrl}`} 
                alt={selectedChat?.name} 
              />
            </Badge>
            <Box sx={{ ml: 2, flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">{selectedChat.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {typingUsers[selectedChat._id] ? (
                  "Typing..."
                ) : (
                  selectedChat.online ? 'Online' : 'Offline'
                )}
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Voice call">
                <IconButton>
                  <Phone size={20} />
                </IconButton>
              </Tooltip>
              {callStatus === 'idle' && (
          <button 
            className="p-2 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100"
            aria-label="Start video call"
          >
            <PhoneCallIcon size={20} />
          </button>
        )}
              <Tooltip title="Chat info">
                <IconButton>
                  <Info size={20} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Chat messages - with its own scrollbar */}
          <Box sx={{ 
            flexGrow: 1, 
            p: 2, 
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#f5f7fb',
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
            {selectedChat.messages && selectedChat.messages.length === 0 ? (
              // Empty chat state
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexGrow: 1
              }}>
                <Avatar 
                  alt={selectedChat.name} 
                  src={selectedChat?.profileImageUrl && selectedChat.profileImageUrl.startsWith('http') 
                    ? selectedChat.profileImageUrl 
                    : `http://localhost:8080/api/v1/auth/uploadss/${selectedChat?.profileImageUrl}`}
                  sx={{ width: 80, height: 80, mb: 2 }}
                />
                <Typography variant="h6">Start a conversation with {selectedChat.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center', maxWidth: 400 }}>
                  Say hello and start chatting with {selectedChat.name}. 
                  Your messages will appear here.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Send size={16} />}
                  onClick={() => {
                    setMessage('Hi ' + selectedChat.name + ', nice to meet you!');
                  }}
                  sx={{ 
                    mt: 3,
                    bgcolor: '#4caf50', 
                    '&:hover': { bgcolor: '#388e3c' },
                    borderRadius: 2,
                    boxShadow: 'none',
                    textTransform: 'none'
                  }}
                >
                  Say Hello
                </Button>
              </Box>
            ) : (
              // Conversation with messages grouped by date
              <>
                {groupedMessages.map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    {/* Date divider */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, mt: groupIndex > 0 ? 3 : 1 }}>
                      <Typography variant="caption" sx={{ bgcolor: '#e1e6ef', px: 2, py: 0.5, borderRadius: 10 }}>
                        {group.displayDate}
                      </Typography>
                    </Box>
                    
                    {/* Messages for this date group */}
                    {group.messages.map((msg) => (
                      <Box 
                        key={msg.id}
                        sx={{ 
                          display: 'flex',
                          flexDirection: msg.isOwn ? 'row-reverse' : 'row',
                          mb: 2,
                          alignItems: 'flex-end'
                        }}
                      >
                        {!msg.isOwn && (
                          <Avatar 
                            alt={selectedChat.name} 
                            src={selectedChat?.profileImageUrl && selectedChat.profileImageUrl.startsWith('http') 
                              ? selectedChat.profileImageUrl 
                              : `http://localhost:8080/api/v1/auth/uploadss/${selectedChat?.profileImageUrl}`}
                            sx={{ width: 32, height: 32, mr: 1 }}
                          />
                        )}
                        <Box
                          sx={{
                            maxWidth: '70%',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: msg.isOwn ? '#4a89dc' : '#fff',
                            color: msg.isOwn ? '#fff' : 'inherit',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            ml: msg.isOwn ? 0 : 1,
                            mr: msg.isOwn ? 1 : 0
                          }}
                        >
                          {msg.text && <Typography variant="body2">{msg.text}</Typography>}
                          
                         
                          {msg.mediaUrls && msg.mediaUrls.length > 0 && (
  msg.mediaUrls.map((mediaUrl, idx) => {
    
    const fullUrl = mediaUrl.startsWith('http') 
      ? mediaUrl 
      : `http://localhost:8080/api/v1/messages/uploads/media/${mediaUrl}`;
    
    
    const fileName = mediaUrl.split('/').pop();
    
    return (
      <FileAttachment
        key={idx}
        mediaUrls={[fullUrl]}
        mediaType={msg.mediaType}
        fileName={fileName}
      />
    );
  })
)}
                          <Typography 
                            variant="caption" 
                            color={msg.isOwn ? "rgba(255,255,255,0.7)" : "text.secondary"} 
                            sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}
                          >
                            {msg.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </React.Fragment>
                ))}
                <div ref={messagesEndRef} /> 
               
              </>
            )}
          </Box>
          
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <Box sx={{ p: 1, bgcolor: '#f5f7fb', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {attachments.map(att => (
                <Box 
                  key={att.id}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    bgcolor: '#e1e6ef', 
                    p: 1, 
                    borderRadius: 1,
                    maxWidth: '200px'
                  }}
                >
                  {att.type.startsWith('image/') ? (
                    <Box component="span" sx={{ mr: 1, color: '#4CAF50' }}>🖼️</Box>
                  ) : att.isAudio || att.type.startsWith('audio/') ? (
                    <Box component="span" sx={{ mr: 1, color: '#F44336' }}>🎤</Box>
                  ) : att.type.startsWith('video/') ? (
                    <Box component="span" sx={{ mr: 1, color: '#2196F3' }}>🎬</Box>
                  ) : (
                    <Box component="span" sx={{ mr: 1 }}>📎</Box>
                  )}
                  <Typography noWrap variant="caption" sx={{ flexGrow: 1 }}>
                    {att.name}
                  </Typography>
                  <IconButton size="small" onClick={() => removeAttachment(att.id)}>
                    <X size={14} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
          
          {/* Message input */}
          <Box sx={{ p: 2, bgcolor: '#fff', borderTop: '1px solid #e0e0e0' }}>
            {isRecording ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: 1,
                bgcolor: '#ffebee',
                borderRadius: 2
              }}>
                <Box sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  bgcolor: '#f44336',
                  mr: 1,
                  animation: 'pulse 1.5s infinite'
                }} />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  Recording... {formatTime(recordingTime)}
                </Typography>
                <Button 
                  variant="contained" 
                  color="error" 
                  size="small"
                  onClick={stopRecording}
                  sx={{ textTransform: 'none' }}
                >
                  Stop
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={(e) => setEmojiAnchorEl(e.currentTarget)}>
                  <Smile size={20} />
                </IconButton>
                <Popover
                  open={openEmojiPicker}
                  anchorEl={emojiAnchorEl}
                  onClose={() => setEmojiAnchorEl(null)}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                >
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </Popover>
                
                <IconButton onClick={() => fileInputRef.current.click()}>
                  <Paperclip size={20} />
                </IconButton>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={typeof message === 'object' ? message.text || '' : message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  variant="outlined"
                  size="small"
                  sx={{ mx: 1 }}
                />
                
                <IconButton onClick={startRecording}>
                  <Mic size={20} />
                </IconButton>
                
                <IconButton 
  color="primary" 
  onClick={() => {
    if (typeof message === 'object' ? (!message.text?.trim() && !attachments.length) : (!message.trim() && !attachments.length)) {
      return; // Don't send empty messages
    }
    
    // Check if handleSendMessage is already handling attachments correctly
    if (typeof handleSendMessage === 'function') {
      // Set attachments in the context
      if (attachments.length > 0) {
        // Set attachments in the ChatContext
        setAttachments(attachments);
      }
      
      // Call the send function
      handleSendMessage();
      
      // Clear local state
      setMessage('');
      setAttachments([]);
    }
  }}
  disabled={(typeof message === 'object' ? !message.text?.trim() : !message.trim()) && attachments.length === 0}
>
  <Send size={20} />
</IconButton>
              </Box>
            )}
          </Box>
        </>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          bgcolor: '#f5f7fb'
        }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: '#e1e6ef' }}>
            <Message size={40} color="#9aa0ac" />
          </Avatar>
          <Typography variant="h6" color="text.secondary">Select a chat to start messaging</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Choose a contact from the list to start a conversation
          </Typography>
        </Box>
      )}
      {/* <VideoCallInterface receiverId={selectedChat?._id} /> */}
    </Box>
  );
};

export default ChatWindow;