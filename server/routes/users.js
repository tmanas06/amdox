const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const userController = require('../controllers/userController');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All user routes require auth
router.use(authenticateToken);

// Get all job seekers
router.get('/job-seekers', userController.getJobSeekers);

// Employer Dashboard Stats
router.get('/dashboard/stats', userController.getEmployerStats);

// Enrich company info
router.get('/enrich-company', userController.enrichCompanyInfo);

// Profile update
router.put('/:id/profile', userController.updateProfile);

// Profile picture upload (placeholder)
router.post('/:id/profile/picture', upload.single('profilePicture'), userController.uploadProfilePicture);

// Upload + parsing (supports both 'resume' and 'cv' via :type)
router.post('/:id/upload/:type', upload.single('file'), userController.uploadResume);

// Download (supports both 'resume' and 'cv' via :type)
router.get('/:id/download/:type', userController.downloadResume);

module.exports = router;

