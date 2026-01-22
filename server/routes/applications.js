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
router.post('/invite', authorizeRole('employer', 'admin'), applicationController.inviteToApply);
router.post('/:id/rounds', authorizeRole('employer', 'admin'), applicationController.addRound);
router.patch('/:id/rounds/:roundId', authorizeRole('employer', 'admin'), applicationController.updateRoundStatus);
router.post('/:id/messages', applicationController.addMessage);

module.exports = router;

