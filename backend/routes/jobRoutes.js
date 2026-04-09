const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { protect, authorize, requireSubscription } = require('../middleware/auth');

router.route('/')
  .get(getJobs)
  .post(protect, authorize('Recruiter', 'Admin'), requireSubscription, createJob);

router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('Recruiter', 'Admin'), requireSubscription, updateJob)
  .delete(protect, authorize('Recruiter', 'Admin'), requireSubscription, deleteJob);

module.exports = router;
