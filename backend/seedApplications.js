require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Payment = require('./models/Payment');
const Application = require('./models/Application');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const candidates = await User.find({ role: 'Candidate' });
  const jobs = await Job.find({}).limit(3);
  
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const job = jobs[i % jobs.length];
    
    // Check if application already exists
    const existing = await Application.findOne({ candidateId: candidate._id, jobId: job._id });
    if (existing) {
      console.log(`Already has application: ${candidate.email} -> ${job.title}`);
      continue;
    }
    
    // Create dummy payment
    const payment = await Payment.create({
      candidateId: candidate._id,
      jobId: job._id,
      stripeSessionId: `seed_${Date.now()}_${i}`,
      amount: job.challengeFee || 500,
      status: 'Successful'
    });
    
    // Create application
    const app = await Application.create({
      candidateId: candidate._id,
      jobId: job._id,
      paymentId: payment._id,
      status: 'Applied',
      refundStatus: 'Pending'
    });
    
    console.log(`Created application: ${candidate.email} -> ${job.title} (${app._id})`);
  }
  
  console.log('\nDone! All candidates now have at least one application.');
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
