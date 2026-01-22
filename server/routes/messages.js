const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/messages/application/:applicationId
// @desc    Get all messages for an application
// @access  Private
router.get('/application/:applicationId', messageController.getApplicationMessages);

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', messageController.sendMessage);

// @route   PUT /api/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/:messageId/read', messageController.markAsRead);

// @route   GET /api/messages/unread/count
// @desc    Get unread message count
// @access  Private
router.get('/unread/count', messageController.getUnreadCount);

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
