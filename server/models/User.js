const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  role: {
    type: String,
    enum: ['job_seeker', 'employer'],
    default: 'job_seeker',
    required: true
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true
  },
  password: {
    type: String,
    minlength: 6,
    select: false // Don't return password by default
  },
  profile: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    photoURL: {
      type: String,
      trim: true,
      default: '' // Profile picture URL (Google photo, Clearbit logo, or uploaded image)
    },
    bio: {
      type: String,
      maxlength: 1000 // Increased from 500 for more detailed bios
    },
    company: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      trim: true
    },
    companySize: {
      type: String,
      trim: true
    },
    // Job Seeker specific fields
    resumeURL: {
      type: String,
      trim: true // URL to uploaded resume (PDF/DOC)
    },
    skills: [{
      type: String,
      trim: true
    }],
    experience: {
      type: String,
      trim: true // e.g., "3-5 years"
    },
    education: {
      type: String,
      trim: true
    },
    // Social links (for both)
    linkedin: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    },
    portfolio: {
      type: String,
      trim: true
    }
  },
  employer: {
    postedJobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    }],
    savedApplications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    }]
  },
  jobSeeker: {
    applications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    }],
    savedJobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    }]
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });

// Method to get user without sensitive data
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
