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
 * GET /api/auth/me
 * Get current authenticated user
 * Requires authentication
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
