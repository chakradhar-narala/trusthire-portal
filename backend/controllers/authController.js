const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendWelcomeEmail, sendLoginEmail, sendOTPEmail } = require('../services/emailService');

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register a user (Candidate, Recruiter)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const resumeUrlParam = req.body.resumeUrl;
  
  // if file is uploaded by multer
  const resumeFile = req.file ? `/uploads/resumes/${req.file.filename}` : resumeUrlParam;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Role validation - restrict Admin creation from open endpoint
    const userRole = role === 'Admin' ? 'Candidate' : (role || 'Candidate');
    
    // Role-based defaults
    const initialTrustScore = userRole === 'Recruiter' ? 50 : 100;
    const initialSubscription = 'none';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      trustScore: initialTrustScore,
      subscriptionStatus: initialSubscription,
      resumeUrl: userRole === 'Candidate' ? (resumeFile || '') : ''
    });

    if (user) {
      // Send Welcome Email (Non-blocking)
      sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err.message));

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore,
        subscriptionStatus: user.subscriptionStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Send Login Notification (Non-blocking)
      sendLoginEmail(user).catch(err => console.error('Login email failed:', err.message));

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore,
        subscriptionStatus: user.subscriptionStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile (Self)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Resume PDF directly
// @route   PUT /api/auth/profile/resume
// @access  Private/Candidate
const updateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const resumeLink = `/uploads/resumes/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, { resumeUrl: resumeLink }, { new: true });

    res.json({ message: 'Resume updated successfully', resumeUrl: resumeLink });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User with this email does not exist' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP and Expiry (5 minutes)
    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOTPEmail(user, otp);
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email }).select('+resetOTP +resetOTPExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.resetOTP || user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const isMatch = await user.matchOTP(otp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+resetOTP +resetOTPExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.resetOTP || user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const isMatch = await user.matchOTP(otp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

    // Update password and clear OTP
    user.password = password;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateResume,
  forgotPassword,
  verifyOTP,
  resetPassword
};
