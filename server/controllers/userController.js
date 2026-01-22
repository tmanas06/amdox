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
  const lines = text.split('\n').map(l => l.trim());
  const idx = lines.findIndex(l => /^skills?\b/i.test(l));
  if (idx === -1) return [];

  const sectionLines = [];
  for (let i = idx; i < lines.length; i++) {
    const line = lines[i];
    if (i > idx && !line) break; // stop at blank line after section
    sectionLines.push(line);
  }

  const combined = sectionLines.join(' ');
  return combined
    .split(/[,\u2022;•|-]/)
    .map(s => s.trim())
    .filter(Boolean);
};

// Generic helper to pull lines under a section header
const extractSectionLines = (text, headerPatterns) => {
  const lines = text.split('\n').map(l => l.trim());
  let start = -1;

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    if (headerPatterns.some(h => lower.startsWith(h))) {
      start = i + 1;
      break;
    }
  }

  if (start === -1) return [];

  const result = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (!line) break;
    // Stop if we hit another likely header
    if (/^[A-Z][A-Za-z ]+:$/.test(line)) break;
    result.push(line);
  }
  return result;
};

const extractSummary = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) {
    // Fallback: first 400 chars of whole text
    return (text || '').slice(0, 400);
  }

  const stopIdx = lines.findIndex(l =>
    /(experience|education|skills)/i.test(l)
  );

  const end = stopIdx === -1 ? Math.min(lines.length, 5) : Math.min(stopIdx, 5);
  return lines.slice(0, end).join(' ');
};

const extractExperience = (text) => {
  const lines = extractSectionLines(text, [
    'experience',
    'work experience',
    'professional experience',
  ]);
  if (!lines.length) return [];

  return [{
    id: Date.now(),
    title: '',
    company: '',
    from: '',
    to: '',
    current: false,
    description: lines.join(' '),
  }];
};

const extractEducation = (text) => {
  const lines = extractSectionLines(text, [
    'education',
    'academic background',
  ]);
  if (!lines.length) return [];

  return [{
    id: Date.now() + 1,
    school: '',
    degree: '',
    field: '',
    from: '',
    to: '',
    description: lines.join(' '),
  }];
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
    const summary = extractSummary(text);
    const experience = extractExperience(text);
    const education = extractEducation(text);

    const profileSuggestions = {
      name,
      email,
      phone,
      skills,
      summary,
      headline: '',
      location: '',
      experience,
      education,
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

