const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Generate JWT token for user
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const PUBLIC_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 'yandex.com', 'mail.com'];

/**
 * Determine user role based on email domain
 * @param {string} email - User's email address
 * @param {string} providedRole - Role provided by frontend (optional)
 * @returns {string} - 'employer' or 'job_seeker'
 */
const determineRole = (email, providedRole = null) => {
  // If role is explicitly provided and valid, use it
  if (providedRole && ['job_seeker', 'employer'].includes(providedRole)) {
    return providedRole;
  }

  // Extract domain from email
  const emailDomain = email.toLowerCase().split('@')[1];

  // If email is NOT a public domain, set as employer
  if (emailDomain && !PUBLIC_DOMAINS.includes(emailDomain)) {
    return 'employer';
  }

  // Default to job_seeker for public domains
  return 'job_seeker';
};

/**
 * Extract company info from email domain
 */
const getCompanyInfo = (email) => {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain || PUBLIC_DOMAINS.includes(domain)) return null;

  const namePart = domain.split('.')[0];
  const companyName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  return {
    company: companyName,
    website: `https://${domain}`,
    logo: `https://logo.clearbit.com/${domain}`
  };
};

/**
 * POST /api/auth/firebase-login
 * Handles Firebase authentication
 * Accepts: { firebaseUid, email, name, photoURL, role }
 */
exports.firebaseLogin = async (req, res) => {
  try {
    const { firebaseUid, email, name, photoURL, role } = req.body;

    // Validate required fields
    if (!firebaseUid || !email) {
      return res.status(400).json({
        success: false,
        message: 'firebaseUid and email are required'
      });
    }

    // Find user by firebaseUid
    let user = await User.findOne({ firebaseUid });

    const emailLower = email.toLowerCase().trim();
    const isPublicDomain = PUBLIC_DOMAINS.includes(emailLower.split('@')[1]);

    if (user) {
      // User exists - update profile information
      user.email = emailLower;
      if (name) user.profile.name = name;

      // Update role based on current email domain
      // Priority: Explicit role > Email domain detection
      const emailDomain = emailLower.split('@')[1];

      if (role && ['job_seeker', 'employer'].includes(role)) {
        user.role = role;
      } else if (emailDomain && !PUBLIC_DOMAINS.includes(emailDomain)) {
        user.role = 'employer';
      } else if (isPublicDomain) {
        if (user.role !== 'employer') {
          user.role = 'job_seeker';
        }
      } else {
        user.role = determineRole(emailLower, role);
      }

      // Always keep Google photo if not already set
      if (!user.profile.photoURL && photoURL) {
        user.profile.photoURL = photoURL;
      }

      // Auto-populate company info if employer (but don't override photo)
      if (user.role === 'employer') {
        const companyInfo = getCompanyInfo(emailLower);
        if (companyInfo) {
          if (!user.profile.company) user.profile.company = companyInfo.company;
          if (!user.profile.website) user.profile.website = companyInfo.website;
          // Store suggested logo URL but don't override existing photo
          // User can manually switch to company logo in profile settings
        }
      }

      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      });
    } else {
      // User doesn't exist - create new user
      const userRole = determineRole(emailLower, role);

      const newUserProfile = {
        name: name || '',
        photoURL: photoURL || '' // Always use Google photo by default
      };

      // Auto-populate company info for new employers (but keep Google photo)
      if (userRole === 'employer') {
        const companyInfo = getCompanyInfo(emailLower);
        if (companyInfo) {
          newUserProfile.company = companyInfo.company;
          newUserProfile.website = companyInfo.website;
          // Keep Google photo - user can manually upload company logo later
        }
      }

      user = new User({
        firebaseUid,
        email: emailLower,
        role: userRole,
        profile: newUserProfile
      });

      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'User created and logged in successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      });
    }
  } catch (error) {
    // Log error for debugging
    console.error('Firebase login error:', error);

    // Handle duplicate email error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Handle MongoDB connection errors
    if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
      console.error('MongoDB error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database connection error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * POST /api/auth/register
 * Handles email/password registration
 * Accepts: { email, password, confirmPassword, role, name, phone }
 */
exports.register = async (req, res) => {
  try {
    const { email, password, confirmPassword, role, name, phone } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine role based on email domain
    const userRole = determineRole(email.toLowerCase().trim(), role);

    // Create new user
    const user = new User({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
      profile: {
        name: name || '',
        phone: phone || ''
      }
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/login
 * Handles email/password login
 * Accepts: { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email (include password field)
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user has a password (might be Firebase-only user)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Firebase authentication. Please sign in with Google.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Requires: JWT token in Authorization header
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // User is attached to request by authenticateToken middleware
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        profile: req.user.profile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      error: error.message
    });
  }
};
