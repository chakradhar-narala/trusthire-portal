const Job = require('../models/Job');

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const filters = { status: 'Active' };
    
    // Support ?search=text (search in title or skills)
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      filters.$or = [
        { title: searchRegex },
        { skills: searchRegex }
      ];
    }
    
    // Simple filtering (legacy / advanced)
    if (req.query.role) filters.title = { $regex: req.query.role, $options: 'i' };
    if (req.query.location) filters.location = { $regex: req.query.location, $options: 'i' };
    
    // Filter by specific skills
    if (req.query.skills) {
      const skillsArray = req.query.skills.split(',').map(s => s.trim());
      filters.skills = { $in: skillsArray.map(s => new RegExp(s, 'i')) };
    }

    // Filter by Employment Type
    if (req.query.employmentType) {
      const types = req.query.employmentType.split(',').map(t => t.trim());
      filters.employmentType = { $in: types };
    }

    // Filter by Minimum Salary (LPA)
    if (req.query.minSalary) {
      filters.salaryLPA = { $gte: Number(req.query.minSalary) };
    }

    const jobs = await Job.find(filters).populate('recruiterId', 'name trustScore email');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiterId', 'name trustScore');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Recruiter
const createJob = async (req, res) => {
  try {
    const { companyName, title, description, skills, location, challengeFee, employmentType, salaryLPA } = req.body;

    if (req.user.trustScore < 20) {
      return res.status(403).json({ message: 'Account restricted due to low trust score. Job posting disabled.' });
    }

    const job = await Job.create({
      recruiterId: req.user._id,
      companyName: companyName || 'Confidential Company',
      title,
      description,
      skills,
      location,
      challengeFee: challengeFee || 500,
      employmentType: employmentType || 'Full Time',
      salaryLPA: salaryLPA || 0
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Recruiter
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Ensure the authenticated user is the job owner
    if (job.recruiterId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'User not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Recruiter
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'User not authorized to delete this job' });
    }

    await job.deleteOne();

    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};
