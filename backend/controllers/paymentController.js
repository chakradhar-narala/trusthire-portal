const Payment = require('../models/Payment');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const isStripeDisabled = () => {
    return !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('replace_me');
};

// @desc    Create Stripe Checkout Session for Job Challenge Fee
// @route   POST /api/payments/create-order
// @access  Private/Candidate
const createOrder = async (req, res) => {
  try {
    const { jobId } = req.body;
    const candidateId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'Active') return res.status(400).json({ message: 'Job is no longer active' });

    const existingApp = await Application.findOne({ candidateId, jobId });
    if (existingApp) return res.status(400).json({ message: 'You have already applied for this job' });

    if (isStripeDisabled()) {
       const dummyPayment = await Payment.create({
          candidateId,
          jobId,
          stripeSessionId: `pending_${Date.now()}`,
          amount: job.challengeFee,
          status: 'Created'
       });
       return res.status(200).json({ checkoutUrl: 'stripe_bypass_success', orderId: `bypass_${Date.now()}`, paymentId: dummyPayment._id });
    }

    // Create Payment record FIRST so we have its _id for the Stripe success URL
    const payment = await Payment.create({
      candidateId,
      jobId,
      stripeSessionId: 'pending_stripe',
      amount: job.challengeFee,
      status: 'Created'
    });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'inr',
                product_data: { name: `Challenge Fee for ${job.title}` },
                unit_amount: job.challengeFee * 100,
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `http://localhost:5173/apply/${jobId}?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment._id}`,
        cancel_url: `http://localhost:5173/jobs/${jobId}?payment=cancelled`,
        metadata: { candidateId, jobId, type: 'job_application' }
    });

    // Update payment with real Stripe session ID
    payment.stripeSessionId = session.id;
    await payment.save();

    res.status(200).json({ checkoutUrl: session.url, orderId: session.id, paymentId: payment._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Payment Session and Create Application
// @route   POST /api/payments/verify
// @access  Private/Candidate
const verifyPayment = async (req, res) => {
  try {
    const { session_id, payment_id } = req.body;
    
    // In actual Stripe webhook this is done automatically.
    // We are simulating polling for bypass OR standard lookup.
    
    let isPaid = false;
    let payment = null;

    if (session_id === 'stripe_bypass_success') {
       payment = await Payment.findById(payment_id);
       if (!payment) return res.status(404).json({ message: 'Payment record not found' });
       isPaid = true;
    } else {
       // Look up from DB based on stripeSessionId
       payment = await Payment.findOne({ stripeSessionId: session_id });
       if (!payment) return res.status(404).json({ message: 'Payment record not found' });

       const session = await stripe.checkout.sessions.retrieve(session_id);
       if (session.payment_status === 'paid') {
           isPaid = true;
       }
    }

    if (isPaid) {
      payment.status = 'Successful';
      await payment.save();

      const existingApp = await Application.findOne({ candidateId: payment.candidateId, jobId: payment.jobId });
      if (existingApp) {
        return res.status(200).json({ message: 'Application already created', applicationId: existingApp._id });
      }

      const application = await Application.create({
        candidateId: payment.candidateId,
        jobId: payment.jobId,
        paymentId: payment._id,
        status: 'Applied',
        refundStatus: 'Pending'
      });

      // Send Application Status Email (Non-blocking)
      const cand = await User.findById(payment.candidateId);
      const j = await Job.findById(payment.jobId);
      if (cand && j) {
        const { sendApplicationStatusEmail } = require('../services/emailService');
        sendApplicationStatusEmail(cand, j, 'Applied', 'Pending')
          .catch(err => console.error('Application email failed:', err.message));
      }

      res.status(200).json({ message: 'Payment verified', applicationId: application._id });
    } else {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Stripe Checkout Session for Recruiter Subscription
// @route   POST /api/payments/subscribe/order
// @access  Private/Recruiter
const createSubscriptionOrder = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    
    if (isStripeDisabled()) {
        return res.status(200).json({ checkoutUrl: 'stripe_bypass_success', orderId: `bypass_${Date.now()}` });
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'inr',
                product_data: { name: `TrustHire Recruiter Access Pass` },
                unit_amount: 999 * 100,
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `http://localhost:5173/subscribe?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:5173/subscribe?payment=cancelled`,
        metadata: {
            recruiterId,
            type: 'subscription'
        }
    });

    res.status(200).json({ checkoutUrl: session.url, orderId: session.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Recruiter Subscription Payment
// @route   POST /api/payments/subscribe/verify
// @access  Private/Recruiter
const verifySubscriptionPayment = async (req, res) => {
  try {
    const { session_id } = req.body;
    const user = await User.findById(req.user.id);

    let isPaid = false;

    if (session_id === 'stripe_bypass_success') {
        isPaid = true;
    } else {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
           isPaid = true;
        }
    }

    if (isPaid) {
      user.subscriptionStatus = 'active';
      user.trustScore += 30; // Boost
      await user.save();

      res.status(200).json({
        message: 'Subscription payment verified successfully.',
        subscriptionStatus: user.subscriptionStatus,
        trustScore: user.trustScore
      });
    } else {
      return res.status(400).json({ message: 'Subscription verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  createSubscriptionOrder,
  verifySubscriptionPayment
};
