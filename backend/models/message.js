const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    default:"no text message"
  },
  read: {
    type: Boolean,
    default: false
  },
  mediaType: {
    type: String,
    enum: ["text", "emoji", "image", "video","audio","file"],
    default:"text"
  },
  mediaUrls:[{
    type:String,
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});


messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);