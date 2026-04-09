const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, createSubscriptionOrder, verifySubscriptionPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Candidate Application Challenge Fee Routes
router.post('/create-order', protect, authorize('Candidate'), createOrder);
router.post('/verify', protect, authorize('Candidate'), verifyPayment);

// Recruiter Subscription Gateway Routes
router.post('/subscribe/order', protect, authorize('Recruiter'), createSubscriptionOrder);
router.post('/subscribe/verify', protect, authorize('Recruiter'), verifySubscriptionPayment);

module.exports = router;
