const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  stripeSessionId: {
    type: String,
    required: true
  },
  stripePaymentIntentId: {
    type: String
  },
  amount: {
    type: Number,
    required: true // Stored in INR generally
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['Created', 'Successful', 'Failed', 'Refunded'],
    default: 'Created'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
