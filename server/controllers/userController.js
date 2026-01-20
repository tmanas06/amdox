const User = require('../models/User');
const pdfParse = require('pdf-parse');

// @desc    Update user profile
// @route   PUT /api/users/:id/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile',
      });
    }

    const updates = req.body || {};

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'profile.name': updates.name,
          'profile.phone': updates.phone,
          'profile.location': updates.location,
          'profile.headline': updates.headline,
          'profile.summary': updates.summary,
          'profile.experience': updates.experience || [],
          'profile.education': updates.education || [],
          'profile.skills': updates.skills || [],
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
    });
  }
};

// @desc    Upload profile picture (stub, file handling can be added later)
// @route   POST /api/users/:id/profile/picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
  // For now just acknowledge; actual storage (S3, etc.) can be wired later
  res.status(200).json({
    success: true,
    message: 'Profile picture upload endpoint not fully implemented yet',
  });
};

// Helpers for resume parsing
const extractEmail = (text) => {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : '';
};

const extractPhone = (text) => {
  const match = text.match(/(\+?\d{1,3}[-.\s]?)?(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
  return match ? match[0] : '';
};

const extractName = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return '';
  const first = lines[0];
  if (first.toLowerCase().includes('resume')) return lines[1] || '';
  return first;
};

const extractSkills = (text) => {
  const lines = text.split('\n');
  const skillsLine = lines.find(l => /skills?/i.test(l));
  if (!skillsLine) return [];
  const afterColon = skillsLine.split(':')[1] || skillsLine;
  return afterColon
    .split(/[,\u2022]/)
    .map(s => s.trim())
    .filter(Boolean);
};

// @desc    Upload resume and return parsed profile suggestions
// @route   POST /api/users/:id/resume
// @access  Private
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required',
      });
    }

    if (req.user._id.toString() !== req.params.id && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile',
      });
    }

    let text = '';

    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      text = data.text || '';
    } else if (req.file.mimetype.startsWith('text/')) {
      text = req.file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported resume format. Please upload a PDF or text file.',
      });
    }

    const name = extractName(text);
    const email = extractEmail(text);
    const phone = extractPhone(text);
    const skills = extractSkills(text);

    const profileSuggestions = {
      name,
      email,
      phone,
      skills,
      summary: '',
      headline: '',
      location: '',
      experience: [],
      education: [],
    };

    res.status(200).json({
      success: true,
      message: 'Resume parsed successfully',
      profile: profileSuggestions,
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to parse resume',
    });
  }
};

