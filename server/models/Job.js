const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  logo: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'],
    required: [true, 'Job type is required']
  },
  salary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    trim: true
  },
  jobId: {
    type: String,
    unique: true,
    trim: true
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  companySize: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  benefits: [{
    type: String,
    trim: true
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'filled'],
    default: 'active'
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }]
}, {
  timestamps: true
});

// Generate job ID before saving
jobSchema.pre('save', function(next) {
  if (!this.jobId) {
    const prefix = this.company.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.jobId = `${prefix}-${random}`;
  }
  next();
});

// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ location: 1, type: 1, isRemote: 1 });

module.exports = mongoose.model('Job', jobSchema);
