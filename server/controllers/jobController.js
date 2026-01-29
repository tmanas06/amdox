const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const { search, location, type, minSalary, maxSalary, experienceLevel, page = 1, limit = 10 } = req.query;
    const query = { status: 'active' };

    // Search by keywords in title, company, or description (Partial Match)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { skills: { $in: [searchRegex] } }
      ];
    }

    // Filter by location
    if (location && location.toLowerCase() !== 'all') {
      if (location.toLowerCase() === 'remote') {
        query.isRemote = true;
      } else {
        query.location = new RegExp(location, 'i');
      }
    }

    // Filter by job type
    if (type && type.toLowerCase() !== 'all') {
      query.type = type;
    }

    // Filter by salary range
    if (minSalary || maxSalary) {
      // Note: This is an approximation since salary is a string. 
      // Real implementation would require numeric salary fields.
      // For now, we'll try to match common patterns if the field exists.
    }

    // Filter by experience level
    if (experienceLevel) {
      query.experience = new RegExp(experienceLevel, 'i');
    }

    const skip = (page - 1) * limit;

    // Find jobs with pagination
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('postedBy', 'profile.name profile.photoURL email')
        .lean(),
      Job.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.warn(`[getJob] Invalid ObjectId received: "${req.params.id}" for URL: ${req.originalUrl}`);
      if (req.user) {
        console.warn(`[getJob] User: ${req.user.email} (Role: ${req.user.role})`);
      }
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'profile.name profile.photoURL');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Employer
exports.createJob = async (req, res) => {
  try {
    console.log('=== CREATE JOB REQUEST ===');
    console.log('User:', req.user);
    console.log('Request Body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = req.user._id || req.user.id;
    console.log('User ID:', userId);

    const jobData = {
      ...req.body,
      postedBy: userId
    };

    console.log('Creating job with data:', jobData);

    const job = await Job.create(jobData);
    console.log('Job created successfully:', job._id);

    // Add job to user's posted jobs
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { 'employer.postedJobs': job._id } },
      { new: true }
    );

    console.log('User updated:', updatedUser ? 'Yes' : 'No');

    if (!updatedUser) {
      console.warn('User not found when updating posted jobs:', userId);
    }

    console.log('=== JOB CREATED SUCCESSFULLY ===');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('=== ERROR CREATING JOB ===');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Full Error:', error);

    res.status(500).json({
      success: false,
      message: 'Error creating job: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Employer
exports.updateJob = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job poster
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Employer
exports.deleteJob = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job poster or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    // Delete the job
    await Job.findByIdAndDelete(req.params.id);

    // Remove job from user's posted jobs
    await User.findByIdAndUpdate(
      job.postedBy,
      { $pull: { 'employer.postedJobs': job._id } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get jobs posted by employer
// @route   GET /api/jobs/employer/my-jobs
// @access  Private/Employer
exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Toggle job status
// @route   PATCH /api/jobs/:id/status
// @access  Private/Employer
exports.toggleJobStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job poster
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    // Toggle between active and inactive
    job.status = job.status === 'active' ? 'inactive' : 'active';
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job ${job.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: job
    });
  } catch (error) {
    console.error('Error toggling job status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Save a job
// @route   POST /api/jobs/:id/save
// @access  Private/JobSeeker
exports.saveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.jobSeeker.savedJobs.includes(job._id)) {
      return res.status(400).json({ success: false, message: 'Job already saved' });
    }

    user.jobSeeker.savedJobs.push(job._id);
    await user.save();

    res.status(200).json({ success: true, message: 'Job saved successfully' });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Unsave a job
// @route   DELETE /api/jobs/:id/save
// @access  Private/JobSeeker
exports.unsaveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.jobSeeker.savedJobs = user.jobSeeker.savedJobs.filter(
      id => id.toString() !== req.params.id
    );
    await user.save();

    res.status(200).json({ success: true, message: 'Job removed from saved' });
  } catch (error) {
    console.error('Error unsaving job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get saved jobs
// @route   GET /api/jobs/saved
// @access  Private/JobSeeker
exports.getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'jobSeeker.savedJobs',
      populate: { path: 'postedBy', select: 'profile.name profile.photoURL' }
    });

    res.status(200).json({
      success: true,
      data: user.jobSeeker.savedJobs
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

