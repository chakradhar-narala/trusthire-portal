const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Attended', 'No-Show', 'Rejected', 'Hired', 'Disputed', 'Resolved'],
    default: 'Applied'
  },
  interviewStatus: {
    type: String,
    enum: ['Pending', 'Scheduled', 'Started', 'Completed', 'No-Show'],
    default: 'Pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  disputeEvidence: {
    type: String,
    default: ''
  },
  interviewStartTime: {
    type: Date
  },
  interviewEndTime: {
    type: Date
  },
  refundStatus: {
    type: String,
    enum: ['Pending', 'Refunded', 'Forfeited'],
    default: 'Pending'
  },
  refundReason: {
    type: String,
    enum: [
      'Rejected by recruiter',
      'Job expired without action',
      'Not shortlisted within deadline',
      'Interview completed',
      'Candidate hired',
      'No-show at interview',
      'Resolved via Dispute (Refund)',
      'Resolved via Dispute (Forfeit)',
      'Manual override'
    ],
    default: null
  },
  refundProcessedAt: {
    type: Date,
    default: null
  },
  meetingLink: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
