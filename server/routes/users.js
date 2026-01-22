const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const userController = require('../controllers/userController');

const upload = multer({ storage: multer.memoryStorage() });

// All user routes require auth
router.use(authenticateToken);

// Get all job seekers
router.get('/job-seekers', userController.getJobSeekers);

// Profile update
router.put('/:id/profile', userController.updateProfile);

// Profile picture upload (placeholder)
router.post('/:id/profile/picture', upload.single('profilePicture'), userController.uploadProfilePicture);

// Resume upload + parsing
router.post('/:id/resume', upload.single('resume'), userController.uploadResume);

module.exports = router;

