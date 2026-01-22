const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Apply to a job (job seeker)
// @route   POST /api/jobs/:id/apply
// @access  Private/job_seeker
exports.applyToJob = async (req, res) => {
  try {
    if (req.user.role !== 'job_seeker') {
      return res.status(403).json({
        success: false,
        message: 'Only job seekers can apply to jobs',
      });
    }

    const jobId = req.params.id;
    const job = await Job.findById(jobId).lean();
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const coverLetter = req.body?.coverLetter || '';

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      employer: job.postedBy,
      coverLetter,
    });

    await Promise.all([
      Job.findByIdAndUpdate(job._id, { $addToSet: { applications: application._id } }),
      User.findByIdAndUpdate(req.user._id, { $addToSet: { 'jobSeeker.applications': application._id } }),
      User.findByIdAndUpdate(job.postedBy, { $addToSet: { 'employer.savedApplications': application._id } }),
    ]);

    return res.status(201).json({
      success: true,
      message: 'Applied successfully',
      data: application,
    });
  } catch (error) {
    // duplicate application
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }
    console.error('Error applying to job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to apply to job',
    });
  }
};

// @desc    Get my applications (job seeker)
// @route   GET /api/applications/me
// @access  Private
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .sort({ createdAt: -1 })
      .populate('job')
      .lean();

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error('Error fetching my applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load applications',
    });
  }
};

// @desc    Get applications for employer jobs
// @route   GET /api/applications/employer
// @access  Private/employer
exports.getEmployerApplications = async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only employers can view employer applications',
      });
    }

    const applications = await Application.find({ employer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('job')
      .populate('applicant', 'email profile')
      .lean();

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error('Error fetching employer applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load employer applications',
    });
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private/employer
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Employer can only update applications to their jobs
    if (req.user.role !== 'admin' && application.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Status updated',
      data: application,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update status',
    });
  }
};

