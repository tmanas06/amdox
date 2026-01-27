const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public routes
router.get('/', jobController.getJobs);

// Protected routes (require authentication)
router.use(authenticateToken);

// Specific routes before generic :id routes!
router.get('/saved', authorizeRole('job_seeker', 'admin'), jobController.getSavedJobs);
router.get('/employer/my-jobs', authorizeRole('employer', 'admin'), jobController.getEmployerJobs);
router.post('/:id/save', authorizeRole('job_seeker', 'admin'), jobController.saveJob);
router.delete('/:id/save', authorizeRole('job_seeker', 'admin'), jobController.unsaveJob);
router.patch('/:id/status', authorizeRole('employer', 'admin'), jobController.toggleJobStatus);
router.post('/:id/apply', authorizeRole('job_seeker', 'admin'), applicationController.applyToJob);

// POST and PUT routes with validation
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company name is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty(),
    check('type', 'Job type is required').isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary']),
    check('description', 'Job description is required').not().isEmpty()
  ],
  authorizeRole('employer', 'admin'),
  jobController.createJob
);

router.put(
  '/:id',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company name is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty(),
    check('type', 'Job type is required').isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary']),
    check('description', 'Job description is required').not().isEmpty()
  ],
  jobController.updateJob
);

router.delete('/:id', jobController.deleteJob);
router.get('/:id', jobController.getJob);

module.exports = router;
