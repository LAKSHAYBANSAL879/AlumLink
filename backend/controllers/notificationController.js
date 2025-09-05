const Notification = require('../models/notification');
const User = require('../models/User');

exports.createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, sourceId, sourceName } = req.body;

    // Validate required fields
    if (!userId || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and notification type are required' 
      });
    }

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create notification
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      sourceId,
      sourceName,
      isRead: false,
      timestamp: new Date()
    });

    const savedNotification = await notification.save();

    if (req.app.io) {
      req.app.io.to(`user-${userId}`).emit('new_notification', savedNotification);
    }

    res.status(201).json({
      success: true,
      data: savedNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

exports.getRecentNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    // Find notifications for the user, sorted by timestamp
    const notifications = await Notification.find({ userId })
      .sort({ timestamp: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    // Count total unread notifications
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        totalFetched: notifications.length
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Update notification
    notification.isRead = true;
    const updatedNotification = await notification.save();

    res.status(200).json({
      success: true,
      data: updatedNotification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    // Update all unread notifications for the user
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Notification.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};
