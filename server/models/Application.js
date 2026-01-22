const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Invited', 'Interview Scheduled', 'Offer Received', 'Rejected', 'Hired'],
      default: 'Applied',
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    rounds: [{
      name: { type: String, required: true }, // e.g., "Screening", "Tech Round 1", "HR"
      status: { type: String, enum: ['Pending', 'Passed', 'Failed', 'Scheduled'], default: 'Pending' },
      scheduledDate: Date,
      feedback: String
    }],
    messages: [{
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

// Prevent duplicate applications per user per job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

