const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/auth/firebase-login
 * Firebase authentication endpoint
 */
router.post('/firebase-login', authController.firebaseLogin);

/**
 * POST /api/auth/register
 * Email/password registration endpoint
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Email/password login endpoint
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/forgot-password
 * Send OTP to email
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * POST /api/auth/verify-otp
 * Verify email OTP
 */
router.post('/verify-otp', authController.verifyOTP);

/**
 * POST /api/auth/reset-password
 * Reset password with OTP
 */
router.post('/reset-password', authController.resetPassword);

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Requires authentication
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
