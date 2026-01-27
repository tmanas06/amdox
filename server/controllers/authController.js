const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');

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
/**
 * POST /api/auth/forgot-password
 * Generates OTP and sends to user email
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // For security reasons, don't reveal if user exists
      return res.status(200).json({ success: true, message: 'If a user with that email exists, an OTP has been sent' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to user (expires in 10 mins)
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset OTP - Amdox',
        text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #333;">Password Reset</h2>
            <p>You requested a password reset for your Amdox account.</p>
            <p>Your OTP is:</p>
            <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #4F46E5; border-radius: 5px;">
              ${otp}
            </div>
            <p style="color: #666; margin-top: 20px;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            <p style="margin-top: 30px;">Best regards,<br>The Amdox Team</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // We still return success because the OTP was generated and saved, 
      // but in production, we'd want to handle this better.
      return res.status(200).json({ success: true, message: 'OTP generated but email sending failed. Please check server logs.' });
    }

    res.status(200).json({ success: true, message: 'OTP sent to email. Please check your inbox and spam folder.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * POST /api/auth/verify-otp
 * Verifies if the provided OTP is correct and not expired
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * POST /api/auth/reset-password
 * Resets the user's password after OTP verification
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    }).select('+password +resetPasswordOTP +resetPasswordOTPExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
