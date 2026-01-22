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
      enum: ['Applied', 'Interview Scheduled', 'Offer Received', 'Rejected', 'Hired'],
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
  },
  { timestamps: true }
);

// Prevent duplicate applications per user per job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

