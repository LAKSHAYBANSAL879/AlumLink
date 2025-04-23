import React, { createContext, useState, useEffect, useRef, useContext, useCallback } from 'react';
import axios from 'axios';
import { UserContext } from '../../userContext';
import Cookies from 'js-cookie';
import io from 'socket.io-client';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const { user } = useContext(UserContext);
  const [attachments, setAttachments] = useState([]);
  
  // Initialize socket connection


  useEffect(() => {
    if (user?._id) {
      const token = Cookies.get('token');
      const newSocket = io('https://alumlink-ruo3.onrender.com', {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to socket.io server');
        // Authenticate user with socket
        newSocket.emit('authenticate', token);
      });
      
      newSocket.on('connect_error', (err) => {
        alert('Socket connection error:', err);
        setError('Connection to chat server failed. Trying to reconnect...');
      });
      
      setSocket(newSocket);
      
      return () => {
        if (newSocket) newSocket.disconnect();
      };
    }
  }, [user?._id]);
  // console.log("socket is ",socket);
  
  // Set up socket event listeners
  const updateUnreadCount = useCallback(async (userId, count) => {
    try {
     
      await axios.put(`https://alumlink-ruo3.onrender.com/api/v1/messages/${userId}/unread`, 
        { 
          unreadCount: count,
          currentUserId: user._id
        }
      );
      
      // Update local state
      setContacts(prevContacts => prevContacts.map(contact => 
        contact._id === userId ? { ...contact, unreadCount: count } : contact
      ));
      
      // Update selected chat if it's the current one
      setSelectedChat(prev => {
        if (prev && prev._id === userId) {
          return { ...prev, unreadCount: count };
        }
        return prev;
      });
    } catch (err) {
      console.error('Error updating unread count:', err);
    }
  }, [user?._id]);

  const fetchContacts = useCallback(async () => {
    try {
      const response = await axios.get(`https://alumlink-ruo3.onrender.com/api/v1/messages/contacts/${user._id}`);
      
      // Store the contacts with empty messages arrays
      const contactsWithEmptyMessages = response.data.map(contact => ({
        ...contact,
        messages: contact.messages || []
      }));
      
      setContacts(contactsWithEmptyMessages);
      return contactsWithEmptyMessages;
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts');
      return [];
    }
  },[user]);

  const fetchMessages = useCallback(async (userId) => {
    if(!userId || !user._id) return;
    try {
      const response = await axios.get(`https://alumlink-ruo3.onrender.com/api/v1/messages/messages/${user._id}/${userId}`);
      
      // Format messages for UI display
      const formattedMessages = response.data.messages.map(msg => ({
        id: msg._id,
        sender: msg.sender._id === user._id ? 'me' : 'other',
        text: msg.text,
        mediaUrls:msg.mediaUrls || [],
        mediaType:msg.mediaType,
        time: new Date(msg.createdAt).toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }),
        isOwn: msg.sender._id === user._id,
        createdAt:msg.createdAt
      }));
      
      // Update the selected contact with messages
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact._id === userId 
            ? { 
                ...contact, 
                messages: formattedMessages,
                unreadCount: 0,
                // Make sure we update these fields with the latest data from the server
                lastMessage: formattedMessages.length > 0 
                  ? formattedMessages[formattedMessages.length - 1].text
                  : contact.lastMessage,
                lastMessageTime: formattedMessages.length > 0 
                  ? formattedMessages[formattedMessages.length - 1].time
                  : contact.lastMessageTime
              } 
            : contact
        )
      );
      
      // If this chat is selected, update selected chat
      if (selectedChat && selectedChat._id === userId) {
        setSelectedChat(prev => ({ 
          ...prev, 
          messages: formattedMessages, 
          unreadCount: 0,
          // Also update these fields for the selected chat
          lastMessage: formattedMessages.length > 0 
            ? formattedMessages[formattedMessages.length - 1].text
            : prev.lastMessage,
          lastMessageTime: formattedMessages.length > 0 
            ? formattedMessages[formattedMessages.length - 1].time
            : prev.lastMessageTime
        }));
        
        // Since we're viewing this chat, mark messages as read
        if (socket && socket.connected) {
          socket.emit('markMessagesRead', { chatWithUserId: userId });
        }
        
        // Also update via REST API for redundancy
        updateUnreadCount(userId, 0);
      }
      
      return formattedMessages;
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      return [];
    }
  },[user]);

  useEffect(() => {
    if (!socket){
      // alert("socket missing");
      return;
    }
    
    const handleNewMessage = ({ senderId, senderName, profileImage, text, time,mediaUrls,mediaType }) => {
      console.log('New message received:', { senderId, text, time,mediaUrls,mediaType });
      
  
      setContacts(prevContacts => {
        const contactExists = prevContacts.some(c => c._id === senderId);
        
        if (contactExists) {
          // Create a new array with the updated contact at the top
          const updatedContacts = prevContacts.map(contact => {
            if (contact._id === senderId) {
              // Add the new message to this contact
              const newMessage = {
                id: Date.now(),
                sender: 'other',
                text,
                time,
                isOwn: false,
                mediaUrls,
                mediaType
                
              };
              
              return {
                ...contact,
                lastMessage: mediaUrls ? (mediaType ? `${mediaType} message` : 'Media message') : (text?.length > 20 ? text.substring(0, 20) + '...' : text),
                lastMessageTime: time,
                unreadCount: (selectedChat && selectedChat._id === senderId) ? 0 : (contact.unreadCount || 0) + 1,
                messages: [...(contact.messages || []), newMessage]
              };
            }
            return contact;
          });
          
          // Move the updated contact to the top
          const updatedContact = updatedContacts.find(c => c._id === senderId);
          const filteredContacts = updatedContacts.filter(c => c._id !== senderId);
          
          return [updatedContact, ...filteredContacts];
        }
        
        // If contact not found, trigger a fetch but don't modify state yet
        console.log('Contact not found, fetching contacts');
        fetchContacts();
        return prevContacts;
      });
      
      // Then, update selectedChat if this is the current chat
      setSelectedChat(prevSelectedChat => {
        if (prevSelectedChat && prevSelectedChat._id === senderId) {
          console.log('Updating selected chat with new message');
          
          const newMessage = {
            id: Date.now(),
            sender: 'other',
            text,
            time,
            isOwn: false,
            mediaUrls,
            mediaType
          };
          
          // Mark messages as read since we're viewing this chat
          if (socket && socket.connected) {
            socket.emit('markMessagesRead', { chatWithUserId: senderId });
          }
          
          updateUnreadCount(senderId, 0);
          
          return {
            ...prevSelectedChat,
            lastMessage: mediaUrls ? (mediaType ? `${mediaType} message` : 'media message') : (text?.length > 20 ? text.substring(0, 20) + '...' : text),
            lastMessageTime: time,
            messages: [...(prevSelectedChat.messages || []), newMessage]
          };
        }
        
        return prevSelectedChat;
      });
    };
    
    // Set up socket event listeners with explicit named handlers
    socket.on('newMessage', handleNewMessage);
    
    // User typing handler
    const handleUserTyping = ({ userId }) => {
      if (selectedChat && selectedChat._id === userId) {
        setTypingUsers(prev => ({ ...prev, [userId]: true }));
        
        setTimeout(() => {
          setTypingUsers(prev => ({ ...prev, [userId]: false }));
        }, 3000);
      }
    };
    
    socket.on('userTyping', handleUserTyping);
    
    // Clean up event listeners
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleUserTyping);
    };
  }, [socket, selectedChat, updateUnreadCount,fetchContacts]); 
  

  const fetchUsers = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('https://alumlink-ruo3.onrender.com/api/v1/auth/allUsers', {
        headers: {
          Authorization: `${token}`,
        }
      });
      setAllUsers(response.data.users);
      return response.data.users;
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data loading and periodic refresh
  useEffect(() => {
    if (user?._id) {
      const fetchData = async () => {
        setLoading(true);
        const [contactsData, usersData] = await Promise.all([
          fetchContacts(),
          fetchUsers()
        ]);
        setLoading(false);
        
        if (selectedChat) {
          const updatedSelectedChat = contactsData.find(c => c._id === selectedChat._id);
          if (updatedSelectedChat) {
            setSelectedChat(updatedSelectedChat); 
          }
        }
      };
  
      fetchData();
  
      const refreshInterval = setInterval(() => {
        fetchUsers();
      }, 3000);
  
      return () => clearInterval(refreshInterval);
    }
  }, [user]);
  
  // Fetch messages when selected chat changes
  useEffect(() => {
    if (selectedChat && selectedChat._id) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);
  
  
  const handleChatSelect = async (userId) => {
    // Find the contact in our current list
    let selectedContact = contacts.find(contact => contact._id === userId);
    
    if (selectedContact) {
      setSelectedChat(selectedContact);
      
      // If we don't have messages yet or we should refresh, fetch them
      if (!selectedContact.messages || selectedContact.messages.length === 0) {
        await fetchMessages(userId);
      }
      
      // Mark messages as read if there are unread messages
      if (selectedContact.unreadCount > 0) {
        // Notify server via socket
        if (socket && socket.connected) {
          socket.emit('markMessagesRead', { chatWithUserId: userId });
        }
        
        // Also update via REST API for redundancy
        await updateUnreadCount(userId, 0);
      }
    }
  };
  
  const handleSendMessage = async () => {
    if ((!message.trim() && attachments.length === 0) || !selectedChat) return;
  
    const currentTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  
    const textToSend = typeof message === 'object' ? message.text?.trim() : message.trim();
    // Get attachments either from context or from local state
    const filesToSend = typeof message === 'object' && message.mediaUrls?.length > 0 
      ? message.mediaUrls 
      : attachments;
    
    const hasAttachments = filesToSend.length > 0;
    
    // Create temporary message objects for UI update
    const newMessages = [];
  
    // Add text message if exists
    if (textToSend) {
      newMessages.push({
        id: Date.now(),
        sender: 'me',
        text: textToSend,
        time: currentTime,
        isOwn: true
      });
    }
  
    // Add attachment messages if any
    if (hasAttachments) {
      filesToSend.forEach(att => {
        const file = att.file || att;
        const mediaType = att.isAudio ? 'audio' : 
                        file.type?.startsWith('image/') ? 'image' :
                        file.type?.startsWith('video/') ? 'video' : 'file';
        
        newMessages.push({
          id: Date.now() + Math.random(), // Ensure unique IDs
          sender: 'me',
          time: currentTime,
          isOwn: true,
          text: textToSend,
          mediaUrls: [URL.createObjectURL(file)], 
          mediaType: mediaType
        });
      });
    }
  
    // Update UI optimistically
    const updatedChat = {
      ...selectedChat,
      messages: [...(selectedChat.messages || []), ...newMessages],
      lastMessage: hasAttachments
        ? (textToSend ? textToSend : `${filesToSend.length} attachment(s)`)
        : (textToSend.length > 20 ? textToSend.slice(0, 20) + '...' : textToSend),
      lastMessageTime: currentTime
    };
  
    setContacts(prevContacts => [
      updatedChat,
      ...prevContacts.filter(c => c._id !== selectedChat._id)
    ]);
    setSelectedChat(updatedChat);
  
    try {
 
      if (textToSend && !hasAttachments && socket && socket.connected) {
        socket.emit('sendMessage', {
          senderId: user._id,
          receiverId: selectedChat._id,
          text: textToSend
        });
      }

      else {
        const formData = new FormData();
        formData.append('receiverId', selectedChat._id);
        formData.append('senderId', user._id);
        
        if (textToSend) {
          formData.append('text', textToSend);
        }
  

const firstFile = filesToSend[0].file || filesToSend[0];
let mediaType = 'file';

if (filesToSend[0].isAudio) {
  mediaType = 'audio';
} else if (firstFile.type?.startsWith('image/')) {
  mediaType = 'image';
} else if (firstFile.type?.startsWith('video/')) {
  mediaType = 'video';
}
else{
  mediaType='file'
;}

formData.append('mediaType', mediaType);

// Add files to FormData
filesToSend.forEach((att, index) => {
  const file = att.file || att;
  formData.append('mediaUrls', file);
});

  
        const response = await axios.post(
          'https://alumlink-ruo3.onrender.com/api/v1/messages/message',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log("Media message response:", response.data);
        
       
        setTimeout(() => fetchMessages(selectedChat._id), 500);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message: ' + (err.response?.data?.message || err.message));
      
      // Optionally show error to user
      alert('Failed to send message: ' + (err.response?.data?.message || err.message));
    } finally {
     
      setMessage('');
      setAttachments([]);
    }
  };
  const typingThrottleRef = useRef(null);
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (socket && socket.connected && selectedChat) {
      // Throttle typing events to avoid flooding
      
      clearTimeout(typingThrottleRef.current);
      
      typingThrottleRef.current = setTimeout(() => {
        socket.emit('typing', { receiverId: selectedChat._id });
      }, 500);
    }
  };
  
  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages]);

  // Start a new chat with a user who isn't in contacts list
  const startNewChat = async (userId) => {
    const user = allUsers.find(u => u._id === userId);
    
    if (!user) return;
  
    // Check if user already exists in contacts
    const existingContact = contacts.find(contact => contact._id === userId);
    
    if (existingContact) {
      await handleChatSelect(userId);
      return;
    }
  
    // Create a new chat entry
    const newContact = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl || '/api/placeholder/40/40',
      online: user.online || false,
      role: user.role,
      lastMessage: '',
      lastMessageTime: '',
      unreadCount: 0,
      messages: [],
      collegeName: user?.collegeName,
      branch: user?.branch,
      currentSemester: user?.currentSemester,
      workingOrganisation: user?.workingOrganisation,
      position: user?.position
    };  
  
    // Add to beginning of contacts
    setContacts(prevContacts => [newContact, ...prevContacts]);
    setSelectedChat(newContact);
  
    // Create chat in backend
    try {
      // const token = Cookies.get('token');
      await axios.post('https://alumlink-ruo3.onrender.com/api/v1/messages/chats', 
        { 
          userId: user._id,
          currentUserId: user._id
        }
      );
    } catch (err) {
      console.error('Error creating new chat:', err);
      setError('Failed to create new chat');
    }
  };
  
  return (
    <ChatContext.Provider value={{
      contacts,
      allUsers,
      selectedChat,
      message,
      loading,
      error,
      messagesEndRef,
      typingUsers,
      attachments,
      setAttachments,
      setSelectedChat,
      setMessage,
      handleChatSelect,
      handleSendMessage,
      handleKeyPress,
      startNewChat,
      fetchContacts,
      fetchMessages,
      
    }}>
      {children}
    </ChatContext.Provider>
  );
};