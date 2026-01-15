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
  
  // If email is NOT @gmail.com, set as employer (company email)
  if (emailDomain && emailDomain !== 'gmail.com') {
    return 'employer';
  }
  
  // Default to job_seeker for @gmail.com emails
  return 'job_seeker';
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

    if (user) {
      // User exists - update profile information
      const emailLower = email.toLowerCase().trim();
      user.email = emailLower;
      if (name) user.profile.name = name;
      if (photoURL) user.profile.photoURL = photoURL;
      
      // Update role based on current email domain
      // Priority: Explicit role > Email domain detection
      const emailDomain = emailLower.split('@')[1];
      
      if (role && ['job_seeker', 'employer'].includes(role)) {
        // Explicit role provided in request - use it
        user.role = role;
      } else if (emailDomain && emailDomain !== 'gmail.com') {
        // Company email (not gmail.com) → set as employer
        user.role = 'employer';
      } else if (emailDomain === 'gmail.com') {
        // Gmail email → set as job_seeker (unless already employer, then keep employer)
        if (user.role !== 'employer') {
          user.role = 'job_seeker';
        }
      } else {
        // Fallback: use determineRole function
        user.role = determineRole(emailLower, role);
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
      const emailLower = email.toLowerCase().trim();
      const userRole = determineRole(emailLower, role);

      user = new User({
        firebaseUid,
        email: emailLower,
        role: userRole,
        profile: {
          name: name || '',
          photoURL: photoURL || ''
        }
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
    // Handle duplicate email error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
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
