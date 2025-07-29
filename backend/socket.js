const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Chat = require('./models/chat.js');
const Message = require('./models/message.js');

// Store connected users
const connectedUsers = new Map();

// Helper function to update chat information when sending messages
async function updateChatInformation(senderId, receiverId, text, mediaFiles = [],mediaType) {
  try {
    const now = new Date();
    
    // Create a summary message text for media files
    let messageText = text || '';
    let lastMessageText = text || ''; // For chat preview
    if (mediaFiles && mediaFiles.length > 0) {
      const fileCount = mediaFiles.length;
      lastMessageText = text ? text : `Media message`;
    }
    
    // Find or create a chat between these users
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    });
    
    if (!chat) {
      // Create new chat if it doesn't exist
      chat = await Chat.create({
        participants: [senderId, receiverId],
        lastMessage: lastMessageText,
        lastMessageTime: now,
        unreadCounts: new Map([[receiverId.toString(), 1]])
      });
      
      // Add each user to the other's contacts
      await User.findByIdAndUpdate(senderId, {
        $addToSet: { contacts: receiverId }
      });
      
      await User.findByIdAndUpdate(receiverId, {
        $addToSet: { contacts: senderId }
      });
    } else {
      // Update existing chat
      chat.lastMessage = lastMessageText;
      chat.lastMessageTime = now;
      
      // Increment unread count for receiver
      const unreadCounts = chat.unreadCounts || new Map();
      const currentCount = unreadCounts.get(receiverId.toString()) || 0;
      unreadCounts.set(receiverId.toString(), currentCount + 1);
      chat.unreadCounts = unreadCounts;
      
      await chat.save();
    }
    
    // Create a new message in database
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text: messageText,
      mediaUrls: mediaFiles.map(file => file.filename), 
      mediaType: mediaFiles.length > 0 ? mediaFiles[0].mimetype.split('/')[0] : null,
      createdAt: now
    });
    return { chat, message };
  } catch (error) {
    console.error('Error updating chat information:', error);
    throw error;
  }
}

// Initialize socket.io with the server
function initializeSocket(io) {
  io.on('connection', async (socket) => {
    console.log('New client connected:', socket.id);
    
    // Authenticate user
    socket.on('authenticate', async (token) => {
      try {
        
      //  const token = socket.handshake.auth.token;

if (!token || typeof token !== 'string') {
  console.error("Invalid or missing token:", token);
  return socket.disconnect(true); 
}
let decoded;
try {
decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET);
  socket.user = decoded; 
} catch (err) {
  console.error("JWT verification failed:", err.message);
  return socket.disconnect(true); 
}

        const userId = decoded.id || decoded.userId; 
        if (userId) {
          // Store socket information
          connectedUsers.set(userId, socket.id);
          
          // Store userId in socket for later use
          socket.userId = userId;
          
          // Update user's online status
          await User.findByIdAndUpdate(userId, { online: true });
          
          console.log(`User ${userId} authenticated with socket ${socket.id}`);
          
          // Broadcast to all clients that this user is now online
          io.emit('userStatusChanged', { userId, online: true });
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Send auth error to client
        socket.emit('authError', { message: 'Authentication failed' });
      }
    });
    
    // Handle private messages (now with media support)
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, text, senderId, mediaUrls,mediaType } = data;
        
        // Validate inputs
        if (!senderId) {
          socket.emit('messageError', { error: 'Missing sender ID' });
          return console.error('Missing sender ID');
        }
        if (!receiverId) {
          socket.emit('messageError', { error: 'Missing receiver ID' });
          return console.error('Missing receiver ID');
        }
        if (!text && (!mediaUrls || mediaUrls.length === 0)) {
          socket.emit('messageError', { error: 'Message must contain text or media' });
          return console.error('Message must contain text or media');
        }
        
        // Get current time
        const now = new Date();
        const time = now.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
        
        // Update chat information and create message
        const { chat, message } = await updateChatInformation(senderId, receiverId, text, mediaUrls,mediaType);
        
        // Get sender details for the notification
        const sender = await User.findById(senderId, 'name profileImageUrl');
        
        // Prepare message data for the client
        const messageData = {
          senderId,
          senderName: sender.name,
          profileImage: sender.profileImageUrl || '/api/placeholder/40/40',
          text,
          time,
          messageId: message._id,
          mediaUrls: message.mediaUrls ? message.mediaUrls.map(m => m.filename) : [],
          mediaType:message.mediaType || null,
        };
        
        // Check if receiver is online
        const receiverSocketId = connectedUsers.get(receiverId);
        
        if (receiverSocketId) {
          // Send directly to the receiver's socket
          io.to(receiverSocketId).emit('newMessage', messageData);
          console.log(`Message sent to online user ${receiverId} via socket ${receiverSocketId}`);
        } else {
          console.log(`User ${receiverId} is offline, message saved to database`);
        }
        
        // Confirm to sender that message was sent
        socket.emit('messageSent', {
          messageId: message._id,
          receiverId,
          time,
          mediaUrls: message.media ? message.media.map(m => m.filename) : [] 
        });
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });
    
    // Handle typing indicator
    socket.on('typing', (data) => {
      try {
        const { receiverId } = data;
        const senderId = socket.userId || data.senderId;
        
        if (!senderId) {
          return console.error('Missing sender ID for typing indicator');
        }
        
        if (!receiverId) {
          return console.error('Missing receiver ID for typing indicator');
        }
        
        // Get receiver's socket ID
        const receiverSocketId = connectedUsers.get(receiverId);
        
        if (receiverSocketId) {
          // Emit directly to the receiver's socket
          io.to(receiverSocketId).emit('userTyping', { userId: senderId });
        }
      } catch (error) {
        console.error('Error handling typing indicator:', error);
      }
    });
    
    // Handle marking messages as read
    socket.on('markMessagesRead', async (data) => {
      try {
        const { chatWithUserId } = data;
        const userId = socket.userId || data.currentUserId;
        
        if (!userId || !chatWithUserId) {
          return console.error('Missing data for marking messages read');
        }
        
        // Find the chat
        const chat = await Chat.findOne({
          participants: { $all: [userId, chatWithUserId] }
        });
        
        if (chat) {
          // Update unread count to 0
          const unreadCounts = chat.unreadCounts || new Map();
          unreadCounts.set(userId.toString(), 0);
          chat.unreadCounts = unreadCounts;
          await chat.save();
          
          // Mark all messages as read
          await Message.updateMany(
            { sender: chatWithUserId, receiver: userId, read: false },
            { read: true }
          );
          
          // Notify the sender that their messages were read
          const senderSocketId = connectedUsers.get(chatWithUserId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('messagesRead', { byUserId: userId });
          }
          
          console.log(`Marked messages as read for chat between ${userId} and ${chatWithUserId}`);
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });
    
    // Handle user disconnection
    socket.on('disconnect', async () => {
      const userId = socket.userId;
      
      if (userId) {
        console.log(`User ${userId} disconnected from socket ${socket.id}`);
        
        // Remove from connected users map
        connectedUsers.delete(userId);
        
        // Update user's online status with a delay to handle page refreshes
        setTimeout(async () => {
          // Check if user reconnected within the grace period
          if (!connectedUsers.has(userId)) {
            await User.findByIdAndUpdate(userId, { 
              online: false,
              lastActive: new Date()
            });
            
            // Broadcast to all clients that this user is now offline
            io.emit('userStatusChanged', { userId, online: false });
            
            console.log(`User ${userId} marked as offline after grace period`);
          }
        }, 5000); // 5 second grace period
      } else {
        console.log('Unauthenticated client disconnected');
      }
    });
  });

  // Return the connectedUsers map so it can be used elsewhere if needed
  return { connectedUsers };
}

module.exports = { initializeSocket };