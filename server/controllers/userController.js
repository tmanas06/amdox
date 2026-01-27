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
          'profile.experience': updates.experience,
          'profile.education': updates.education,
          'profile.skills': updates.skills || [],
          'profile.company': updates.company,
          'profile.bio': updates.bio,
          'profile.website': updates.website,
          'profile.industry': updates.industry,
          'profile.companySize': updates.companySize,
          'profile.photoURL': updates.photoURL,
          'profile.resumeURL': updates.resumeURL,
          'profile.linkedin': updates.linkedin,
          'profile.github': updates.github,
          'profile.portfolio': updates.portfolio,
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
    const line = lines[i];
    const lowerLine = line.toLowerCase().trim();

    // Strict header check
    const isHeader = headers.some(h => {
      // Exact match
      if (lowerLine === h) return true;
      // Match with colon
      if (lowerLine === h + ':') return true;
      // Match startsWith but only if line is short (preventing sentence matches)
      if (lowerLine.startsWith(h) && lowerLine.length < h.length + 10) return true;
      return false;
    });

    if (isHeader) {
      startIdx = i + 1;
      break;
    }
  }

  if (startIdx === -1) return '';

  let sectionContent = [];
  // Common section headers that indicate a new section
  const nextSectionHeaders = [
    'work experience', 'professional experience', 'experience', 'employment history', 'employment',
    'education', 'academic background', 'qualification', 'qualifications',
    'skills', 'technical skills', 'expertise', 'technologies', 'core competencies',
    'projects', 'certifications', 'certificates', 'certification',
    'summary', 'professional summary', 'profile', 'about me', 'about',
    'contact', 'languages', 'awards', 'publications', 'references'
  ];

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue; // Skip empty lines

    const lowerLine = line.toLowerCase().trim();

    // Check if this line is a section header
    const isNewSection = nextSectionHeaders.some(h => {
      // Exact match (case-insensitive)
      if (lowerLine === h) return true;
      // Match with colon
      if (lowerLine === h + ':') return true;
      return false;
    });

    if (isNewSection) break;

    sectionContent.push(line);
  }

  const result = sectionContent.join('\n');
  return result;
};

const parseExperience = (expText) => {
  if (!expText || expText.trim().length === 0) return [];

  const lines = expText.split('\n').map(l => l.trim()).filter(Boolean);
  const experiences = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const lowerLine = line.toLowerCase().trim();

    // Skip section headers
    const sectionHeaders = ['work experience', 'professional experience', 'experience', 'employment history', 'employment'];
    if (sectionHeaders.some(h => lowerLine === h || lowerLine === h + ':')) {
      i++;
      continue;
    }

    // Skip bullet points and technology lines at the start
    if (line.startsWith('•') || line.startsWith('-') || lowerLine.startsWith('technolog')) {
      i++;
      continue;
    }

    // Potential job title (usually first non-bullet line)
    const title = line;
    i++;

    if (i >= lines.length) break;

    // Next line is usually company and location
    let company = lines[i];
    let from = '';
    let to = '';
    i++;

    // Check if next line contains dates
    if (i < lines.length) {
      const dateLine = lines[i];
      // Look for date patterns like "January 2021 - Present" or "2019 - 2020"
      if (/\d{4}|january|february|march|april|may|june|july|august|september|october|november|december/i.test(dateLine)) {
        // Extract dates
        const dateParts = dateLine.split('-').map(d => d.trim());
        if (dateParts.length >= 2) {
          from = dateParts[0];
          to = dateParts[1];
        }
        i++;
      }
    }

    // Collect description lines (bullet points)
    const descLines = [];
    while (i < lines.length) {
      const descLine = lines[i];
      // Stop if we hit what looks like a new job title (not a bullet point)
      const isBullet = descLine.startsWith('•') || descLine.startsWith('-');
      const isTech = descLine.toLowerCase().startsWith('technolog');

      console.log(`Desc line check: "${descLine.substring(0, 20)}..." | Bullet: ${isBullet} | Tech: ${isTech}`);

      if (!isBullet && !isTech) {
        console.log("Breaking description loop - new title candidate");
        // This might be a new job title
        break;
      }
      descLines.push(descLine.replace(/^[•\-]\s*/, ''));
      i++;

      // Limit description lines
      if (descLines.length >= 5) break;
    }

    // Only add if we have at least a title
    if (title && title.length > 2 && !title.startsWith('•')) {
      experiences.push({
        id: Date.now() + experiences.length,
        title: title.slice(0, 100),
        company: company.slice(0, 100),
        from,
        to,
        current: /present|current/i.test(to),
        description: descLines.join(' ').slice(0, 500)
      });
    }

    // Limit to 5 experiences
    if (experiences.length >= 5) break;
  }

  return experiences.length > 0 ? experiences : [];
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
    console.log('📄 Resume upload request received');

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ success: false, message: 'Resume file is required' });
    }

    console.log('📋 File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer?.length
    });

    if (req.user._id.toString() !== req.params.id && req.user.id !== req.params.id) {
      console.log('❌ Unauthorized access attempt');
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let text = '';

    // Extract text from file
    try {
      if (req.file.mimetype === 'application/pdf') {
        console.log('📖 Parsing PDF file...');
        const data = await pdfParse(req.file.buffer);
        text = data.text || '';
        console.log('✅ PDF parsed. Text length:', text.length);
        console.log('📝 First 200 chars:', text.substring(0, 200));
      } else {
        console.log('📖 Reading text file...');
        text = req.file.buffer.toString('utf-8');
        console.log('✅ Text file read. Length:', text.length);
        console.log('📝 First 200 chars:', text.substring(0, 200));
      }
    } catch (parseError) {
      console.error('❌ Error parsing file:', parseError);
      return res.status(500).json({
        success: false,
        message: 'Failed to read resume file. Please ensure it\'s a valid PDF or text file.'
      });
    }

    if (!text || text.trim().length < 50) {
      console.log('⚠️ Extracted text is too short or empty');
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from resume. Please ensure the PDF is not image-based or corrupted.'
      });
    }

    // Extract information
    console.log('🔍 Extracting information from text...');

    const name = extractName(text);
    console.log('👤 Extracted name:', name);

    const email = extractEmail(text);
    console.log('📧 Extracted email:', email);

    const phone = extractPhone(text);
    console.log('📱 Extracted phone:', phone);

    const skills = extractSkills(text);
    console.log('🛠️ Extracted skills:', skills.length, 'skills found');

    const summaryText = extractSectionText(text, ['summary', 'professional summary', 'profile', 'about me']);
    console.log('📄 Extracted summary length:', summaryText.length);

    const expText = extractSectionText(text, ['experience', 'work experience', 'professional experience', 'employment history']);
    console.log('💼 Extracted experience text length:', expText.length);

    const eduText = extractSectionText(text, ['education', 'academic background', 'qualification']);
    console.log('🎓 Extracted education text length:', eduText.length);

    const experience = parseExperience(expText);
    const education = parseEducation(eduText);

    const profileSuggestions = {
      name,
      email,
      phone,
      skills,
      summary: summaryText.slice(0, 500) || text.split('\n').filter(l => l.length > 10).slice(0, 3).join(' ').slice(0, 500),
      headline: name ? `${name} | Tech Professional` : '',
      location: '',
      experience,
      education,
    };

    console.log('✅ Profile suggestions generated:', {
      hasName: !!name,
      hasEmail: !!email,
      hasPhone: !!phone,
      skillsCount: skills.length,
      hasSummary: !!profileSuggestions.summary,
      experienceCount: experience.length,
      educationCount: education.length
    });

    res.status(200).json({
      success: true,
      message: 'Resume parsed successfully',
      profile: profileSuggestions,
      debug: {
        textLength: text.length,
        extractedFields: {
          name: !!name,
          email: !!email,
          phone: !!phone,
          skills: skills.length,
          experience: experience.length,
          education: education.length
        }
      }
    });
  } catch (error) {
    console.error('❌ Error parsing resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to parse resume. Please try again or contact support.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// @desc    Get employer dashboard stats
// @route   GET /api/users/dashboard/stats
// @access  Private (Employer only)
exports.getEmployerStats = async (req, res) => {
  try {
    const employerId = req.user._id;

    // Parallelize queries for performance
    const [activeJobsCount, totalApplicationsCount, applications, recentJobs, activeCandidates] = await Promise.all([
      // 1. Active Postings
      require('../models/Job').countDocuments({ postedBy: employerId, status: 'active' }),

      // 2. Total Applications
      require('../models/Application').countDocuments({ employer: employerId }),

      // 3. Recent Applications (Last 5)
      require('../models/Application').find({ employer: employerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('job', 'title')
        .populate('applicant', 'profile.name email')
        .lean(),

      // 4. Recent Jobs (Last 5)
      require('../models/Job').find({ postedBy: employerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title createdAt status')
        .lean(),

      // 5. Active Candidates (Unique applicants)
      require('../models/Application').distinct('applicant', { employer: employerId })
    ]);

    // Combine and sort activities
    const activities = [
      ...applications.map(app => ({
        id: app._id,
        type: 'Application',
        description: `New application for ${app.job?.title || 'a job'}`,
        candidate: app.applicant?.profile?.name || app.applicant?.email || 'Candidate',
        time: app.createdAt
      })),
      ...recentJobs.map(job => ({
        id: job._id,
        type: 'Job',
        description: `Posted new job: ${job.title}`,
        candidate: job.status === 'active' ? 'Active' : 'Inactive', // Reusing candidate field for status/info
        time: job.createdAt
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    res.status(200).json({
      success: true,
      stats: {
        activePostings: activeJobsCount,
        totalApplications: totalApplicationsCount,
        activeCandidates: activeCandidates.length,
        profileViews: Math.floor(Math.random() * 50) + 10 // Placeholder for now
      },
      recentActivity: activities
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};
