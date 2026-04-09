require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('./models/Application');
const User = require('./models/User');
const Job = require('./models/Job');
const Payment = require('./models/Payment');
const refundService = require('./services/refundService');

const verifyRefundEngine = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for verification...');

    // 1. Setup Mock User (Candidate)
    let candidate = await User.findOne({ email: 'test_candidate@example.com' });
    if (!candidate) {
      candidate = await User.create({
        name: 'Test Candidate',
        email: 'test_candidate@example.com',
        password: 'password123',
        trustScore: 100
      });
    }
    const initialScore = candidate.trustScore;
    console.log(`Initial TrustScore: ${initialScore}`);

    // 2. Setup Mock Job
    let recruiter = await User.findOne({ role: 'Recruiter' });
    const job = await Job.create({
      recruiterId: recruiter._id,
      title: 'Test Refund Job',
      description: 'Test',
      skills: ['Test'],
      location: 'Test',
      challengeFee: 500,
      expirationDate: new Date(Date.now() - 1000) // Expired
    });

    // 3. Setup Mock Payment
    const payment = await Payment.create({
      candidateId: candidate._id,
      jobId: job._id,
      stripeSessionId: 'mock_session',
      amount: 500,
      status: 'Successful'
    });

    // 4. Setup Mock Application
    const app = await Application.create({
      candidateId: candidate._id,
      jobId: job._id,
      paymentId: payment._id,
      status: 'Applied',
      refundStatus: 'Pending',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days old
    });

    console.log('--- Scenario 1: Stale Application Check ---');
    await refundService.checkStaleApplications();
    
    const updatedApp = await Application.findById(app._id);
    const updatedCandidate = await User.findById(candidate._id);
    
    console.log(`Refund Status: ${updatedApp.refundStatus} (Expected: Refunded)`);
    console.log(`Refund Reason: ${updatedApp.refundReason} (Expected: Not shortlisted within deadline)`);
    console.log(`TrustScore: ${updatedCandidate.trustScore} (Expected: ${initialScore + 10})`);

    console.log('--- Scenario 2: Forfeit on No-Show ---');
    const app2 = await Application.create({
      candidateId: candidate._id,
      jobId: job._id,
      paymentId: payment._id,
      status: 'Shortlisted',
      interviewStatus: 'Started',
      refundStatus: 'Pending'
    });
    
    await refundService.processForfeit(app2._id, 'No-show at interview');
    const updatedApp2 = await Application.findById(app2._id);
    const finalCandidate = await User.findById(candidate._id);
    
    console.log(`Refund Status: ${updatedApp2.refundStatus} (Expected: Forfeited)`);
    console.log(`TrustScore: ${finalCandidate.trustScore} (Expected: ${updatedCandidate.trustScore - 30})`);

    // Cleanup
    await Application.deleteMany({ jobId: job._id });
    await Payment.deleteMany({ jobId: job._id });
    await Job.findByIdAndDelete(job._id);
    
    console.log('Verification Complete. Cleaning up...');
    process.exit(0);
  } catch (err) {
    console.error('Verification Failed:', err);
    process.exit(1);
  }
};

verifyRefundEngine();
