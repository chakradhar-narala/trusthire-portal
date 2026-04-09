require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Payment = require('./models/Payment');
const Application = require('./models/Application');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const apps = await Application.find({})
    .populate('jobId', 'title')
    .populate('candidateId', 'name email')
    .populate('paymentId', 'amount status');
  
  console.log('Total applications:', apps.length);
  apps.forEach(a => {
    console.log('---');
    console.log('  ID:', a._id.toString());
    console.log('  Candidate:', a.candidateId?.email, '| ID:', a.candidateId?._id?.toString());
    console.log('  Job:', a.jobId?.title);
    console.log('  Status:', a.status);
    console.log('  RefundStatus:', a.refundStatus);
    console.log('  Payment amount:', a.paymentId?.amount, '| status:', a.paymentId?.status);
  });
  
  // Also check total users
  const users = await User.find({ role: 'Candidate' }, 'name email _id');
  console.log('\nCandidates:');
  users.forEach(u => console.log(' ', u.email, u._id.toString()));
  
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
