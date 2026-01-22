const Message = require('../models/Message');
const Application = require('../models/Application');
const User = require('../models/User');

/**
 * @desc    Get all messages for an application
 * @route   GET /api/messages/application/:applicationId
 * @access  Private
 */
exports.getApplicationMessages = async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Verify user has access to this application
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user is either the applicant or employer
        const userId = req.user._id.toString();
        const isApplicant = application.applicant.toString() === userId;
        const isEmployer = application.employer.toString() === userId;

        if (!isApplicant && !isEmployer) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these messages'
            });
        }

        const messages = await Message.find({ application: applicationId })
            .populate('sender', 'profile.name profile.photoURL email role')
            .populate('recipient', 'profile.name profile.photoURL email role')
            .sort({ createdAt: 1 }); // Oldest first

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
    try {
        const { applicationId, recipientId, content, messageType } = req.body;

        if (!applicationId || !recipientId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Application ID, recipient ID, and content are required'
            });
        }

        // Verify application exists and user has access
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const userId = req.user._id.toString();
        const isApplicant = application.applicant.toString() === userId;
        const isEmployer = application.employer.toString() === userId;

        if (!isApplicant && !isEmployer) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send messages for this application'
            });
        }

        // Create message
        const message = await Message.create({
            application: applicationId,
            sender: req.user._id,
            recipient: recipientId,
            content: content.trim(),
            messageType: messageType || 'text'
        });

        // Populate sender and recipient details
        await message.populate('sender', 'profile.name profile.photoURL email role');
        await message.populate('recipient', 'profile.name profile.photoURL email role');

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

/**
 * @desc    Mark message as read
 * @route   PUT /api/messages/:messageId/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only recipient can mark as read
        if (message.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to mark this message as read'
            });
        }

        message.isRead = true;
        await message.save();

        res.status(200).json({
            success: true,
            message: 'Message marked as read',
            data: message
        });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark message as read',
            error: error.message
        });
    }
};

/**
 * @desc    Get unread message count for user
 * @route   GET /api/messages/unread/count
 * @access  Private
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            recipient: req.user._id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count',
            error: error.message
        });
    }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:messageId
 * @access  Private
 */
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only sender can delete their own message
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this message'
            });
        }

        await message.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message',
            error: error.message
        });
    }
};
