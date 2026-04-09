const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['Candidate', 'Recruiter', 'Admin'],
    default: 'Candidate'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  trustScore: {
    type: Number,
    // Default will be handled in controller (Candidate: 100, Recruiter: 50)
    default: 100 
  },
  subscriptionStatus: {
    type: String,
    enum: ['none', 'active', 'expired'],
    default: 'none'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  jobPostsCount: {
    type: Number,
    default: 0 
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  headline: {
    type: String,
    default: ''
  },
  resetOTP: {
    type: String,
    default: null,
    select: false
  },
  resetOTPExpiry: {
    type: Date,
    default: null,
    select: false
  }
}, {
  timestamps: true
});

// Encrypt password or OTP using bcrypt
userSchema.pre('save', async function() {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  if (this.isModified('resetOTP') && this.resetOTP) {
    const salt = await bcrypt.genSalt(10);
    this.resetOTP = await bcrypt.hash(this.resetOTP, salt);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Match user entered OTP to hashed OTP in database
userSchema.methods.matchOTP = async function(enteredOTP) {
  if (!this.resetOTP) return false;
  return await bcrypt.compare(enteredOTP, this.resetOTP);
};

module.exports = mongoose.model('User', userSchema);
