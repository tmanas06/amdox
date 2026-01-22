const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

router.use(authenticateToken);

// Job seeker
router.get('/me', applicationController.getMyApplications);

// Employer
router.get('/employer', authorizeRole('employer', 'admin'), applicationController.getEmployerApplications);
router.patch('/:id/status', authorizeRole('employer', 'admin'), applicationController.updateStatus);

module.exports = router;

