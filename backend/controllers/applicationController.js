const Application = require('../models/Application');
const Job = require('../models/Job');
const refundService = require('../services/refundService');
const { sendApplicationStatusEmail } = require('../services/emailService');
const User = require('../models/User');

// @desc    Get Candidate's own applications
// @route   GET /api/applications/my
// @access  Private/Candidate
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user.id })
      .populate('jobId', 'title location challengeFee status')
      .populate('paymentId', 'amount status');
      
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Applications for a specific Job
// @route   GET /api/applications/job/:jobId
// @access  Private/Recruiter,Admin
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiterId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('candidateId', 'name email trustScore');
      
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Application Status (Shortlist, Reject, Hire)
// @route   PUT /api/applications/:id/status
// @access  Private/Recruiter
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.jobId.recruiterId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    application.status = status;

    // Trigger Refund if Rejected OR Hired
    if (status === 'Rejected') {
      if (application.refundStatus !== 'Refunded' && application.refundStatus !== 'Forfeited') {
        await refundService.processRefund(application._id, 'Rejected by recruiter');
      }
    } else if (status === 'Hired') {
      if (application.refundStatus !== 'Refunded' && application.refundStatus !== 'Forfeited') {
        await refundService.processRefund(application._id, 'Candidate hired');
      }
      // Award Recruiter +10 TrustScore explicit to picking a hired candidate
      const User = require('../models/User');
      await User.findByIdAndUpdate(application.jobId.recruiterId, { $inc: { trustScore: 10 } });
    }

    await application.save();

    // Send Status Email (Non-blocking)
    const cand = await User.findById(application.candidateId);
    if (cand) {
       sendApplicationStatusEmail(cand, application.jobId, status, application.refundStatus)
         .catch(err => console.error('Status email failed:', err.message));
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Trigger Interview Start
// @route   PUT /api/applications/:id/interview-start
// @access  Private/Recruiter
const startInterview = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.jobId.recruiterId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Generate an 10-character unique ID for the Meet link (abc-defg-hij)
    const charset = 'abcdefghijklmnopqrstuvwxyz';
    const part1 = Array.from({ length: 3 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
    const part2 = Array.from({ length: 4 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
    const part3 = Array.from({ length: 3 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
    const link = `https://meet.google.com/${part1}-${part2}-${part3}`;

    application.interviewStatus = 'Started';
    application.interviewStartTime = new Date();
    application.meetingLink = link;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Trigger Interview End
// @route   PUT /api/applications/:id/interview-end
// @access  Private/Recruiter
const endInterview = async (req, res) => {
  try {
    const { status } = req.body; // 'Completed' or 'No-Show'
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.jobId.recruiterId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    application.interviewStatus = status;
    application.interviewEndTime = new Date();
    
    // Process Refund or Forfeit based on attendance
    if (status === 'Completed') {
      await refundService.processRefund(application._id, 'Interview completed');
    } else if (status === 'No-Show') {
      await refundService.processForfeit(application._id, 'No-show at interview');
    }
    
    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Raise Dispute
// @route   POST /api/applications/:id/dispute
// @access  Private/Candidate
const raiseDispute = async (req, res) => {
  try {
    const { reason } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.candidateId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    application.status = 'Disputed';
    application.disputeEvidence = reason || 'No evidence provided';
    await application.save();

    // Send Dispute Email
    const j = await Job.findById(application.jobId);
    sendApplicationStatusEmail(req.user, j, 'Disputed', 'Pending')
      .catch(err => console.error('Dispute email failed:', err.message));

    res.json({ message: 'Dispute raised successfully', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Disputes
// @route   GET /api/applications/admin/disputes
// @access  Private/Admin
const getAllDisputes = async (req, res) => {
  try {
    const disputes = await Application.find({ status: 'Disputed' })
      .populate('jobId', 'title recruiterId')
      .populate('candidateId', 'name email trustScore');
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve Dispute
// @route   POST /api/applications/:id/resolve
// @access  Private/Admin
const resolveDispute = async (req, res) => {
  try {
    const { resolution, adminNotes } = req.body; // 'Refund' or 'Forfeit'
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = 'Resolved';
    application.adminNotes = adminNotes || '';

    const User = require('../models/User');

    if (resolution === 'Refund') {
      await refundService.processRefund(application._id, 'Resolved via Dispute (Refund)');
      // Penalize Recruiter (-30) for dispute loss/fraud
      await User.findByIdAndUpdate(application.jobId.recruiterId, { $inc: { trustScore: -30 } });
    } else if (resolution === 'Forfeit') {
      await refundService.processForfeit(application._id, 'Resolved via Dispute (Forfeit)');
      // We don't further penalize the candidate because processForfeit already gave them -30.
    }

    await application.save();
    res.json({ message: `Dispute resolved via ${resolution}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  startInterview,
  endInterview,
  raiseDispute,
  getAllDisputes,
  resolveDispute
};
