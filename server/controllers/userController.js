const User = require('../models/User');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

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

    const cleanList = (list, allowedFields) => {
      if (!list || !Array.isArray(list)) return [];
      return list.map(item => {
        const newItem = {};
        // Only keep allowed fields
        allowedFields.forEach(field => {
          if (item[field] !== undefined) newItem[field] = item[field];
        });
        // Keep _id only if it's a valid MongoDB ObjectId (24 hex chars)
        if (item._id && typeof item._id === 'string' && /^[0-9a-fA-F]{24}$/.test(item._id)) {
          newItem._id = item._id;
        }
        return newItem;
      });
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'profile.name': updates.name,
          'profile.phone': updates.phone,
          'profile.location': updates.location,
          'profile.headline': updates.headline,
          'profile.summary': updates.summary,
          'profile.experience': cleanList(updates.experience, ['title', 'company', 'from', 'to', 'current', 'description']),
          'profile.education': cleanList(updates.education, ['school', 'degree', 'field', 'from', 'to']),
          'profile.projects': cleanList(updates.projects, ['title', 'description', 'link']),
          'profile.certifications': cleanList(updates.certifications, ['name', 'issuer', 'date']),
          'profile.skills': updates.skills || [],
          'profile.company': updates.company,
          'profile.bio': updates.bio,
          'profile.website': updates.website,
          'profile.industry': updates.industry,
          'profile.companySize': updates.companySize,
          'profile.photoURL': updates.photoURL,
          'profile.resumeURL': updates.resumeURL,
          'profile.resumeFile': updates.resumeFile,
          'profile.cvURL': updates.cvURL,
          'profile.cvFile': updates.cvFile,
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
  const match = text.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  return match ? match[0] : '';
};

const extractSocialLinks = (text) => {
  const links = { linkedin: '', github: '', portfolio: '' };
  const lines = text.split('\n').map(l => l.trim());
  lines.forEach(line => {
    if (/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i.test(line)) {
      const match = line.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
      if (match) links.linkedin = 'https://' + match[0];
    }
    if (/github\.com\/[a-zA-Z0-9_-]+/i.test(line)) {
      const match = line.match(/github\.com\/[a-zA-Z0-9_-]+/i);
      if (match) links.github = 'https://' + match[0];
    }
    if (/(portfolio|website|blog).*https?:\/\/[^\s]+/i.test(line)) {
      const match = line.match(/https?:\/\/[^\s]+/i);
      if (match) links.portfolio = match[0];
    }
  });
  return links;
};

const extractName = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  if (!lines.length) return '';
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i];
    if (!/resume|curriculum|vitae|contact|profile|summary|email/i.test(line)) return line;
  }
  return lines[0];
};

const extractSkills = (text) => {
  const skillsList = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Express', 'MongoDB',
    'SQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'HTML', 'CSS', 'TypeScript',
    'Angular', 'Vue', 'Django', 'Flask', 'Spring Boot', 'PostgreSQL', 'Redis', 'Git'
  ];
  const foundSkills = new Set();
  skillsList.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) foundSkills.add(skill);
  });
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
  const lines = text.split('\n').map(l => l.trim()).filter((l, i, arr) => !l || l !== arr[i - 1] || i === 0);
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const lowerLine = lines[i].toLowerCase();
    if (headers.some(h => lowerLine === h || lowerLine === h + ':' || lowerLine.startsWith(h) && lowerLine.length < h.length + 10)) {
      startIdx = i + 1;
      break;
    }
  }
  if (startIdx === -1) return '';
  let content = [];
  const nx = ['work experience', 'experience', 'education', 'academic background', 'qualification', 'qualifications', 'skills', 'technical skills', 'expertise', 'technologies', 'core competencies', 'projects', 'personal projects', 'key projects', 'certifications', 'certificates', 'certification', 'summary', 'professional summary', 'profile', 'about me', 'about', 'contact', 'achievements', 'awards', 'publications', 'references'];
  for (let i = startIdx; i < lines.length; i++) {
    if (!lines[i]) continue;
    if (nx.some(h => lines[i].toLowerCase() === h || lines[i].toLowerCase() === h + ':')) break;
    content.push(lines[i]);
  }
  return content.join('\n');
};

const parseExperience = (expText) => {
  if (!expText) return [];
  const lines = expText.split('\n').map(l => l.trim()).filter(Boolean);
  const experiences = [];
  let i = 0;

  while (i < lines.length && experiences.length < 5) {
    const line = lines[i];
    // Skip section headers accidentally included
    if (/experience|history|employment/i.test(line) && line.length < 15) { i++; continue; }

    let title = '', company = '', from = '', to = '', description = '';

    // Advanced line parsing for common PDF merged patterns
    // e.g., "Blockchain DeveloperJul 2024 – May 2025" or "EvangelistMay – Oct 2024"
    const rangePattern = /(([A-Z][a-z]{2}\s+)?\d{4}|[A-Z][a-z]{2})\s*[-–—|]\s*(([A-Z][a-z]{2}\s+)?\d{4}|present|current)/i;
    const singleDatePattern = /([A-Z][a-z]{2}\s+\d{4}|\d{4})$/i;

    const rangeMatch = line.match(rangePattern);
    const singleMatch = line.match(singleDatePattern);

    if (rangeMatch) {
      from = rangeMatch[1];
      to = rangeMatch[2];
      title = line.substring(0, line.indexOf(rangeMatch[0])).trim();
      // Clean title of typical merged artifacts (delimiters, months, years)
      title = title.replace(/([-–—|]|[A-Z][a-z]{2}|[0-9]{4})\s*$/, '').trim();
    } else if (singleMatch) {
      from = singleMatch[1];
      title = line.substring(0, line.indexOf(singleMatch[0])).trim();
      title = title.replace(/([-–—|]|[A-Z][a-z]{2})\s*$/, '').trim();
    }
    else if (line.includes('|') || line.includes(' - ') || line.includes(' – ') || (line.includes(',') && line.split(',').length > 1)) {
      const parts = line.split(/[|]|\s[-–—]\s|,/).map(p => p.trim()).filter(Boolean);
      parts.forEach(part => {
        if (/\d{4}|present|current/i.test(part)) {
          if (!from) from = part; else if (!to) to = part;
        } else if (!title) title = part; else if (!company) company = part;
      });
    } else if (!line.startsWith('•') && !line.startsWith('-')) {
      title = line;
    }

    // Try to find company on next line if not found
    if (i + 1 < lines.length && !company && !lines[i + 1].startsWith('•') && !lines[i + 1].startsWith('-')) {
      company = lines[i + 1];
      // Clean company of artifacts like "Remote" merged at the end
      if (company.endsWith('Remote')) company = company.replace(/Remote$/, '').trim();
      i++;
    }

    i++;
    const descLines = [];
    while (i < lines.length) {
      const nextLine = lines[i];
      // If next line looks like a new entry (capitalized, short, might contain date), stop
      if (!nextLine.startsWith('•') && !nextLine.startsWith('-') && nextLine.length < 60 &&
        (nextLine.includes('|') || nextLine.includes(' - ') || nextLine.includes(' – ') || nextLine.match(/\d{4}/))) break;

      descLines.push(nextLine.replace(/^[•\-]\s*/, ''));
      i++;
      if (descLines.length > 8) break;
    }

    if (title || company) {
      experiences.push({
        title: title || 'Professional Experience',
        company: company || 'Organization',
        from,
        to,
        current: /present|current/i.test(to),
        description: descLines.join(' ')
      });
    }
  }
  return experiences;
};

const parseEducation = (eduText) => {
  if (!eduText) return [];
  const lines = eduText.split('\n').map(l => l.trim()).filter(Boolean);
  const education = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/university|college|institute|school/i.test(line) || education.length === 0) {
      let degree = '', field = '', from = '', to = '';
      let j = i + 1;
      while (j < Math.min(i + 4, lines.length)) {
        const nl = lines[j];
        if (/(bachelor|master|doctor|phd|diploma|degree|b\.s\.|m\.s\.)/i.test(nl)) {
          degree = nl;
          if (nl.includes(' of ')) field = nl.split(' of ')[1]; else if (nl.includes(' in ')) field = nl.split(' in ')[1];
        } else if (/\d{4}/.test(nl)) {
          const p = nl.split(/[-–—|]/).map(d => d.trim());
          from = p[0] || ''; to = p[1] || '';
        } else if (/computer science|engineering|business/i.test(nl) && !field) field = nl;
        if (/university|college|institute|school/i.test(nl) && j > i + 1) break;
        j++;
      }
      education.push({ school: line, degree, field, from, to });
      i = j - 1;
    }
    if (education.length >= 3) break;
  }
  return education;
};

const parseProjects = (projText) => {
  if (!projText) return [];
  const lines = projText.split('\n').map(l => l.trim()).filter(Boolean);
  const projects = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(projects|personal projects|key projects)/i.test(line)) continue;
    if (!line.startsWith('•') && !line.startsWith('-')) {
      const title = line;
      let description = '', link = '';
      const lm = line.match(/https?:\/\/[^\s]+/);
      if (lm) link = lm[0];
      let j = i + 1;
      while (j < lines.length && (lines[j].startsWith('•') || lines[j].startsWith('-') || lines[j].length > 40)) {
        description += ' ' + lines[j].replace(/^[•\-]\s*/, '');
        const dlm = lines[j].match(/https?:\/\/[^\s]+/);
        if (dlm && !link) link = dlm[0];
        if (j + 1 < lines.length && !lines[j + 1].startsWith('•') && !lines[j + 1].startsWith('-') && lines[j + 1].length < 50 && /^[A-Z]/.test(lines[j + 1])) break;
        j++;
      }
      i = j - 1;
      projects.push({ title: title.replace(/https?:\/\/[^\s]+/, '').replace(/[\s||\-–—]+$/, '').trim(), description: description.trim(), link });
    }
    if (projects.length >= 5) break;
  }
  return projects;
};

const parseCertifications = (certText) => {
  if (!certText) return [];
  const lines = certText.split('\n').map(l => l.trim()).filter(Boolean);
  const certs = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const issuers = ['aws', 'google', 'microsoft', 'cisco', 'oracle', 'coursera', 'udemy'];
    let issuer = '';
    issuers.forEach(is => { if (line.toLowerCase().includes(is)) issuer = is.charAt(0).toUpperCase() + is.slice(1); });
    if (line.toLowerCase().includes('certificat') || line.toLowerCase().includes('certified') || issuer) {
      let date = '';
      const dm = line.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}|\d{4}/i);
      if (dm) date = dm[0]; else {
        let j = i + 1;
        while (j < Math.min(i + 3, lines.length)) {
          const ndm = lines[j].match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}|\d{4}/i);
          if (ndm) { date = ndm[0]; if (lines[j].length < 30) i = j; break; }
          j++;
        }
      }
      certs.push({ name: line.replace(/^[•\-]|\bcertificate|\bcertification/gi, '').trim(), issuer, date });
    }
  }
  return certs.slice(0, 5);
};

exports.uploadResume = async (req, res) => {
  try {
    const { type } = req.params; // 'resume' or 'cv'
    if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });
    if (req.user._id.toString() !== req.params.id && req.user.id !== req.params.id) return res.status(403).json({ success: false, message: 'Not authorized' });

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
    const summary = extractSectionText(text, ['summary', 'profile', 'about me', 'introduction']);
    const experience = parseExperience(extractSectionText(text, ['experience', 'history']));
    const education = parseEducation(extractSectionText(text, ['education']));
    const projects = parseProjects(extractSectionText(text, ['projects']));
    const certifications = parseCertifications(extractSectionText(text, ['certifications', 'certificates']));
    const socials = extractSocialLinks(text);

    let fileURL = '';
    const fileName = `${type}_${req.params.id}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '..', 'uploads', fileName);
    fs.writeFileSync(filePath, req.file.buffer);
    fileURL = `/uploads/${fileName}`;

    // Prepare response with specific field for the uploaded type
    const profileData = {
      name, email, phone, skills, summary,
      headline: name ? `${name} | Tech Professional` : '',
      experience, education, projects, certifications, ...socials
    };

    if (type === 'cv') {
      profileData.cvURL = fileURL;
      profileData.cvFile = { name: req.file.originalname, uploadedAt: new Date() };
    } else {
      profileData.resumeURL = fileURL;
      profileData.resumeFile = { name: req.file.originalname, uploadedAt: new Date() };
    }

    res.status(200).json({
      success: true,
      message: `${type === 'cv' ? 'CV' : 'Resume'} parsed and uploaded successfully`,
      profile: profileData
    });
  } catch (error) {
    console.error('Error parsing file:', error);
    res.status(500).json({ success: false, message: 'Failed to parse file.' });
  }
};

exports.downloadResume = async (req, res) => {
  try {
    const { type } = req.params;
    const user = await User.findById(req.params.id);
    const fileURL = type === 'cv' ? user?.profile?.cvURL : user?.profile?.resumeURL;

    if (!user || !fileURL) return res.status(404).json({ success: false, message: `${type === 'cv' ? 'CV' : 'Resume'} not found` });
    const filePath = path.join(__dirname, '..', fileURL);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found' });
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getEmployerStats = async (req, res) => {
  try {
    const employerId = req.user._id;
    const [activeJobsCount, totalApplicationsCount, applications, recentJobs, activeCandidates] = await Promise.all([
      require('../models/Job').countDocuments({ postedBy: employerId, status: 'active' }),
      require('../models/Application').countDocuments({ employer: employerId }),
      require('../models/Application').find({ employer: employerId }).sort({ createdAt: -1 }).limit(5).populate('job', 'title').populate('applicant', 'profile.name email').lean(),
      require('../models/Job').find({ postedBy: employerId }).sort({ createdAt: -1 }).limit(5).select('title createdAt status').lean(),
      require('../models/Application').distinct('applicant', { employer: employerId })
    ]);
    const activities = [
      ...applications.map(app => ({ id: app._id, type: 'Application', description: `New application for ${app.job?.title || 'a job'}`, candidate: app.applicant?.profile?.name || app.applicant?.email || 'Candidate', time: app.createdAt })),
      ...recentJobs.map(job => ({ id: job._id, type: 'Job', description: `Posted new job: ${job.title}`, candidate: job.status === 'active' ? 'Active' : 'Inactive', time: job.createdAt }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
    res.status(200).json({ success: true, stats: { activePostings: activeJobsCount, totalApplications: totalApplicationsCount, activeCandidates: activeCandidates.length, profileViews: Math.floor(Math.random() * 50) + 10 }, recentActivity: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics' });
  }
};
