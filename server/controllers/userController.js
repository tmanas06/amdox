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
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
    });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile picture upload endpoint not fully implemented yet',
  });
};

// @desc    Get all job seekers
// @route   GET /api/users/job-seekers
// @access  Private (Employer only)
exports.getJobSeekers = async (req, res) => {
  try {
    const jobSeekers = await User.find({ role: 'job_seeker' })
      .select('-password -firebaseUid')
      .lean();

    res.status(200).json({
      success: true,
      count: jobSeekers.length,
      data: jobSeekers
    });
  } catch (error) {
    console.error('Error fetching job seekers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates'
    });
  }
};

/* --- ENHANCED RESUME PARSING LOGIC --- */

const extractEmail = (text) => {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : '';
};

const extractPhone = (text) => {
  // Matches various formats: +91 9999999999, (123) 456-7890, etc.
  const match = text.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  return match ? match[0] : '';
};

const extractName = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  if (!lines.length) return '';

  // Usually the name is in the first 3 lines
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i];
    // Ignore lines that look like headers or common titles
    if (!/resume|curriculum|vitae|contact|profile|summary|email/i.test(line)) {
      return line;
    }
  }
  return lines[0];
};

const extractSkills = (text) => {
  const skillsList = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Express', 'MongoDB',
    'SQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'HTML', 'CSS', 'TypeScript',
    'Angular', 'Vue', 'Django', 'Flask', 'Spring Boot', 'PostgreSQL', 'Redis', 'Git',
    'Agile', 'Scrum', 'Figma', 'UI/UX', 'Mobile App', 'Android', 'iOS', 'Flutter'
  ];

  const foundSkills = new Set();

  // Method 1: Keyword matching
  skillsList.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      foundSkills.add(skill);
    }
  });

  // Method 2: Section extraction
  const lines = text.split('\n').map(l => l.trim());
  const idx = lines.findIndex(l => /^(skills|technical skills|technologies|expertise)/i.test(l));
  if (idx !== -1) {
    let skillText = '';
    for (let i = idx + 1; i < Math.min(idx + 10, lines.length); i++) {
      if (/experience|education|projects|summary/i.test(lines[i])) break;
      skillText += ' ' + lines[i];
    }
    const extracted = skillText.split(/[,\u2022;•|-]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 30);
    extracted.forEach(s => foundSkills.add(s));
  }

  return Array.from(foundSkills).slice(0, 15);
};

const extractSectionText = (text, headers) => {
  const lines = text.split('\n').map(l => l.trim());
  let startIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (headers.some(h => line === h || line.startsWith(h))) {
      startIdx = i + 1;
      break;
    }
  }

  if (startIdx === -1) return '';

  let sectionContent = [];
  const nextSectionHeaders = ['experience', 'education', 'skills', 'projects', 'summary', 'about', 'contact', 'languages', 'certifications'];

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Check if we hit another section
    if (nextSectionHeaders.some(h => lowerLine === h || lowerLine.startsWith(h + ':'))) break;
    if (line) sectionContent.push(line);
  }

  return sectionContent.join('\n');
};

const parseExperience = (expText) => {
  if (!expText) return [];

  const lines = expText.split('\n').filter(Boolean);
  const experiences = [];

  // Attempt to identify blocks (usually 2-4 experiences max for parsing)
  // This is a simplified version. In a real app, one might use NLP.
  if (lines.length > 0) {
    experiences.push({
      id: Date.now(),
      title: lines[0].slice(0, 50),
      company: lines[1] ? lines[1].slice(0, 50) : '',
      from: '',
      to: '',
      current: false,
      description: lines.slice(2, 6).join(' ')
    });
  }

  return experiences;
};

const parseEducation = (eduText) => {
  if (!eduText) return [];
  const lines = eduText.split('\n').filter(Boolean);

  if (lines.length > 0) {
    return [{
      id: Date.now() + 1,
      school: lines[0].slice(0, 50),
      degree: lines[1] ? lines[1].slice(0, 50) : '',
      field: '',
      from: '',
      to: '',
    }];
  }
  return [];
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resume file is required' });
    }

    if (req.user._id.toString() !== req.params.id && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let text = '';
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      text = data.text || '';
    } else {
      text = req.file.buffer.toString('utf-8');
    }

    const name = extractName(text);
    const email = extractEmail(text);
    const phone = extractPhone(text);
    const skills = extractSkills(text);
    const summaryText = extractSectionText(text, ['summary', 'professional summary', 'profile', 'about me']);
    const expText = extractSectionText(text, ['experience', 'work experience', 'professional experience', 'employment history']);
    const eduText = extractSectionText(text, ['education', 'academic background', 'qualification']);

    const profileSuggestions = {
      name,
      email,
      phone,
      skills,
      summary: summaryText.slice(0, 500) || text.split('\n').filter(l => l.length > 10).slice(0, 3).join(' ').slice(0, 500),
      headline: name ? `${name} | Tech Professional` : '',
      location: '',
      experience: parseExperience(expText),
      education: parseEducation(eduText),
    };

    res.status(200).json({
      success: true,
      message: 'Resume parsed successfully',
      profile: profileSuggestions,
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    res.status(500).json({ success: false, message: 'Failed to parse resume' });
  }
};
