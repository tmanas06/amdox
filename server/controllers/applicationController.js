const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Message = require('../models/Message');
const { sendEmail } = require('../utils/emailService');

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

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const application = await Application.findById(applicationId)
      .populate('job')
      .populate('applicant', 'name email profile')
      .populate('employer', 'name email')
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Authorization check
    // Allow if user is the applicant, the employer, or an admin
    const userId = req.user._id.toString();
    const isApplicant = application.applicant?._id.toString() === userId || application.applicant.toString() === userId;
    const isEmployer = application.employer?._id.toString() === userId || application.employer.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isEmployer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    return res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Error fetching application by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch application'
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

    // Add system message to application
    const systemMsg = `Application status updated to: ${status}`;
    application.messages.push({
      sender: req.user._id,
      content: systemMsg,
      timestamp: new Date()
    });

    await application.save();

    // Create Message document for the chat view
    await Message.create({
      application: application._id,
      sender: req.user._id,
      recipient: application.applicant,
      content: systemMsg,
      messageType: 'notification'
    });

    // Send Email notification
    try {
      const applicant = await User.findById(application.applicant);
      const job = await Job.findById(application.job);

      if (applicant && applicant.email) {
        await sendEmail({
          to: applicant.email,
          subject: `Update on your application for ${job.title}`,
          text: `Hi ${applicant.profile?.name || 'there'},\n\nYour application status for "${job.title}" at "${job.company}" has been updated to: ${status}.\n\nLog in to Amdox to see more details.\n\nBest regards,\nThe Amdox Team`,
          html: `<p>Hi ${applicant.profile?.name || 'there'},</p><p>Your application status for <strong>${job.title}</strong> at <strong>${job.company}</strong> has been updated to: <strong>${status}</strong>.</p><p>Log in to <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard">Amdox</a> to see more details.</p><p>Best regards,<br>The Amdox Team</p>`
        });
      }
    } catch (emailErr) {
      console.error('Failed to send status update email:', emailErr);
    }

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

// @desc    Invite candidate to apply
// @route   POST /api/applications/invite
// @access  Private/employer
exports.inviteToApply = async (req, res) => {
  try {
    const { applicantId, jobId } = req.body || {};

    if (!applicantId || !jobId) {
      return res.status(400).json({ success: false, message: 'Applicant ID and Job ID are required' });
    }

    // Verify job belongs to employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to invite for this job' });
    }

    // Check if application already exists
    const existingApp = await Application.findOne({ job: jobId, applicant: applicantId });
    if (existingApp) {
      return res.status(409).json({ success: false, message: 'Application/Invitation already exists' });
    }

    const application = await Application.create({
      job: jobId,
      applicant: applicantId,
      employer: req.user._id,
      status: 'Invited',
      coverLetter: 'Invited by employer',
    });

    await Promise.all([
      Job.findByIdAndUpdate(jobId, { $addToSet: { applications: application._id } }),
      User.findByIdAndUpdate(applicantId, { $addToSet: { 'jobSeeker.applications': application._id } }),
      User.findByIdAndUpdate(req.user._id, { $addToSet: { 'employer.savedApplications': application._id } }),
    ]);

    return res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: application,
    });

  } catch (error) {
    console.error('Error inviting candidate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send invitation',
    });
  }
};

// @desc    Add round to application
// @route   POST /api/applications/:id/rounds
// @access  Private/employer
exports.addRound = async (req, res) => {
  try {
    const { name, scheduledDate } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Round name is required' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.rounds.push({
      name,
      scheduledDate: scheduledDate || null,
      status: 'Pending'
    });

    // Add status message
    const roundMsg = `New interview round scheduled: ${name}${scheduledDate ? ` on ${new Date(scheduledDate).toLocaleString()}` : ''}`;
    application.messages.push({
      sender: req.user._id,
      content: roundMsg,
      timestamp: new Date()
    });

    await application.save();

    // Create Message document
    await Message.create({
      application: application._id,
      sender: req.user._id,
      recipient: application.applicant,
      content: roundMsg,
      messageType: 'notification'
    });

    // Send Email
    try {
      const applicant = await User.findById(application.applicant);
      const job = await Job.findById(application.job);

      if (applicant && applicant.email) {
        await sendEmail({
          to: applicant.email,
          subject: `Interview Scheduled: ${name}`,
          text: `Hi ${applicant.profile?.name || 'there'},\n\nAn interview round "${name}" has been scheduled for your application as "${job.title}" at "${job.company}".\n\n${scheduledDate ? `Date: ${new Date(scheduledDate).toLocaleString()}` : 'Date: To be decided'}\n\nLog in to Amdox for more details.\n\nBest regards,\nThe Amdox Team`,
          html: `<p>Hi ${applicant.profile?.name || 'there'},</p><p>An interview round <strong>${name}</strong> has been scheduled for your application as <strong>${job.title}</strong> at <strong>${job.company}</strong>.</p><p>${scheduledDate ? `<strong>Date:</strong> ${new Date(scheduledDate).toLocaleString()}` : '<strong>Date:</strong> To be decided'}</p><p>Log in to <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard">Amdox</a> for more details.</p><p>Best regards,<br>The Amdox Team</p>`
        });
      }
    } catch (emailErr) {
      console.error('Failed to send round addition email:', emailErr);
    }

    res.status(200).json({
      success: true,
      data: application.rounds
    });
  } catch (error) {
    console.error('Error adding round:', error);
    res.status(500).json({ success: false, message: 'Failed to add round' });
  }
};

// @desc    Update round status
// @route   PATCH /api/applications/:id/rounds/:roundId
// @access  Private/employer
exports.updateRoundStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const round = application.rounds.id(req.params.roundId);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Round not found' });
    }

    if (status) round.status = status;
    if (feedback) round.feedback = feedback;

    await application.save();

    res.status(200).json({ success: true, data: application.rounds });
  } catch (error) {
    console.error('Error updating round:', error);
    res.status(500).json({ success: false, message: 'Failed to update round' });
  }
};

// @desc    Add message to application (Chat)
// @route   POST /api/applications/:id/messages
// @access  Private
exports.addMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Allow both employer and applicant to message
    if (application.employer.toString() !== req.user._id.toString() &&
      application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.messages.push({
      sender: req.user._id,
      content,
      timestamp: new Date()
    });

    await application.save();

    // Populate sender info for the new message
    const newMessage = application.messages[application.messages.length - 1];
    const populatedApp = await Application.populate(application, {
      path: 'messages.sender',
      select: 'profile.name email role'
    });

    res.status(200).json({
      success: true,
      data: populatedApp.messages
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

