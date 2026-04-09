const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Please provide the hiring Company Name'],
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  skills: {
    type: [String],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  challengeFee: {
    type: Number,
    required: true,
    default: 500 // ₹500 fee
  },
  employmentType: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Freelance', 'Internship'],
    default: 'Full Time'
  },
  salaryLPA: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Closed'],
    default: 'Active'
  },
  expirationDate: {
    type: Date,
    required: true,
    // Default to 15 days from creation
    default: () => Date.now() + 15 * 24 * 60 * 60 * 1000 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
