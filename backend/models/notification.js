const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['donation', 'job', 'blog', 'chat', 'system','application'],

  },
  title: {
    type: String,
  },
  message: {
    type: String,
  },
  sourceId: {
    type: String,
  },
  sourceName: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });


module.exports = mongoose.model('Notification', notificationSchema);