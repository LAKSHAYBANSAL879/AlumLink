const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/', notificationController.createNotification);

// Get recent notifications for a user
router.get('/:userId', notificationController.getRecentNotifications);

router.put('/:id/read', notificationController.markAsRead);

router.put('/:userId/read-all', notificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;