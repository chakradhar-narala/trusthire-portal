const express = require('express');
const router = express.Router();
const {
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  startInterview,
  endInterview,
  raiseDispute,
  getAllDisputes,
  resolveDispute
} = require('../controllers/applicationController');
const { protect, authorize, requireSubscription } = require('../middleware/auth');

router.get('/my', protect, authorize('Candidate'), getMyApplications);
router.get('/job/:jobId', protect, authorize('Recruiter', 'Admin'), requireSubscription, getJobApplications);

router.put('/:id/status', protect, authorize('Recruiter', 'Admin'), requireSubscription, updateApplicationStatus);
router.put('/:id/interview-start', protect, authorize('Recruiter', 'Admin'), requireSubscription, startInterview);
router.put('/:id/interview-end', protect, authorize('Recruiter', 'Admin'), requireSubscription, endInterview);

router.post('/:id/dispute', protect, authorize('Candidate'), raiseDispute);
router.get('/admin/disputes', protect, authorize('Admin'), getAllDisputes);
router.post('/:id/resolve', protect, authorize('Admin'), resolveDispute);

module.exports = router;
