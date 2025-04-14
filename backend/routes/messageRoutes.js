const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getContacts,
  updateUnreadCount,
  createChat
} = require('../controllers/messageController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/media';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'media-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  // Accept images and common file types
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|mp3|mp4|webm|zip/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Unsupported file format!'));
  }
};

// Initialize multer with configurations
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
  fileFilter: fileFilter
});

// API routes
router.post('/message', upload.array('mediaUrls', 5),sendMessage);
router.get('/messages/:userId/:currentUserId',  getMessages);
router.get('/contacts/:userId', getContacts);
router.put('/:userId/unread', updateUnreadCount);
router.post('/chats', createChat);
router.use('/uploads/media', express.static(path.join(__dirname, '../uploads/media')));

module.exports = router;