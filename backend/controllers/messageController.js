const Message = require('../models/message');
const Chat = require('../models/chat');
const User = require('../models/User');
const Notification=require('../models/notification')

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text,senderId,mediaType } = req.body;
 
    
    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID and message text are required' });
    }
    
    // Find or create a chat between these two users
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    });
    
    if (!chat) {
      chat = await Chat.create({
        participants: [senderId, receiverId],
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
      // Increment unread count for receiver
      const unreadCounts = chat.unreadCounts || new Map();
      const currentCount = unreadCounts.get(receiverId.toString()) || 0;
      unreadCounts.set(receiverId.toString(), currentCount + 1);
      chat.unreadCounts = unreadCounts;
    }
    const mediaUrls = req.files ? req.files.map(file => file.filename) : [];

    // Create new message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
      mediaUrls,
      mediaType
    });
    
    let previewText = text || '';
    if (mediaUrls.length > 0) {
      if (!text) {
        if (mediaUrls.length === 1) {
          previewText = '📎 Media shared';
        } else {
          previewText = `📎 ${mediaUrls.length} media files shared`;
        }
      }
    }
    
    // Update chat with last message info
    chat.lastMessage = previewText;
    chat.lastMessageTime = Date.now();
    await chat.save();
    
       const sentBy = await User.findById(senderId);
              
       try {
        const notificationToAuthor = new Notification({
          userId: receiverId,
          type: 'chat',
          title: previewText,
          message: `${sentBy.name} messaged you`,
          sourceId: sentBy._id,
          refModel: 'Message',
          sourceName: sentBy.name
        });
        
        const savedAuthorNotification = await notificationToAuthor.save();
        
        if (req.app.io) {
          req.app.io.to(`user-${receiverId}`).emit('new_notification', savedAuthorNotification);
        }
      } catch (notificationError) {
        console.log('Error saving notification:', notificationError);
      }

    res.status(201).json({ message });
    
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId, currentUserId} = req.params;
   
    
    // Find messages between the two users, ordered by creation time
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name profileImageUrl')
    .populate('receiver', 'name profileImageUrl');
    
    // Mark all messages from the other user as read
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, read: false },
      { read: true }
    );
    
    // Update unread count to 0 for current user
    const chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] }
    });
    
    if (chat) {
      const unreadCounts = chat.unreadCounts || new Map();
      unreadCounts.set(currentUserId.toString(), 0);
      chat.unreadCounts = unreadCounts;
      await chat.save();
    }
    
    res.status(200).json({ messages });
    
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Failed to get messages', error: error.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const {userId} = req.params;
    
    // Get user with populated contacts
    const user = await User.findById(userId).populate('contacts')
    
    // Get all chats for this user
    const chats = await Chat.find({
      participants: userId
    }).sort({ lastMessageTime: -1 });
    
    // Map contacts to include last message info
    const contactsWithChatInfo = await Promise.all(user.contacts.map(async contact => {
      const chat = chats.find(c => 
        c.participants.some(p => p.toString() === contact._id.toString())
      );
      
      // Only add message info if a chat exists
      if (chat) {
        const unreadCount = chat.unreadCounts?.get(userId.toString()) || 0;
        
        return {
          _id: contact._id,
          name: contact.name,
          email: contact.email,
          profileImageUrl: contact.profileImageUrl,
          online: contact.online,
          role: contact.role,
          collegeName: contact.collegeName,
          branch: contact.branch,
          currentSemester: contact.currentSemester,
          workingOrganisation: contact.workingOrganisation,
          position: contact.position,
          lastMessage: chat.lastMessage,
          lastMessageTime: chat.lastMessageTime,
          unreadCount: unreadCount
        };
      }
      
      return contact.toObject();
    }));
    
    // Sort contacts by last message time
    const sortedContacts = contactsWithChatInfo.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });
    
    res.status(200).json(sortedContacts);
    
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ message: 'Failed to get contacts', error: error.message });
  }
};

exports.updateUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { unreadCount,currentUserId } = req.body;
    // const currentUserId = req.user._id;
    
    // Find the chat
    const chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] }
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Update unread count
    const unreadCounts = chat.unreadCounts || new Map();
    unreadCounts.set(currentUserId.toString(), unreadCount);
    chat.unreadCounts = unreadCounts;
    await chat.save();
    
    res.status(200).json({ message: 'Unread count updated' });
    
  } catch (error) {
    console.error('Error updating unread count:', error);
    res.status(500).json({ message: 'Failed to update unread count', error: error.message });
  }
};

exports.createChat = async (req, res) => {
  try {
    const { userId,currentUserId } = req.body;
    // const currentUserId = req.user._id;
    
    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] }
    });
    
    if (existingChat) {
      return res.status(200).json({ message: 'Chat already exists', chat: existingChat });
    }
    
    // Create new chat
    const chat = await Chat.create({
      participants: [currentUserId, userId],
      unreadCounts: new Map()
    });
    
    // Add each user to the other's contacts
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { contacts: userId }
    });
    
    await User.findByIdAndUpdate(userId, {
      $addToSet: { contacts: currentUserId }
    });
    
    res.status(201).json({ message: 'Chat created', chat });
    
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat', error: error.message });
  }
};