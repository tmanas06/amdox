const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
            required: true,
            index: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
        },
        isRead: {
            type: Boolean,
            default: false
        },
        attachments: [{
            filename: String,
            url: String,
            fileType: String,
            size: Number
        }],
        messageType: {
            type: String,
            enum: ['text', 'system', 'notification'],
            default: 'text'
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt
    }
);

// Indexes for efficient queries
messageSchema.index({ application: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });

// Virtual for conversation participants
messageSchema.virtual('participants').get(function () {
    return [this.sender, this.recipient];
});

module.exports = mongoose.model('Message', messageSchema);
