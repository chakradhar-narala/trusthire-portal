const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('./models/Job');
const User = require('./models/User');

dotenv.config();

const sampleJobs = [
  { companyName: 'Google', title: 'Senior AI Researcher', location: 'Mountain View, CA', type: 'Full Time', lpa: 45, skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning'] },
  { companyName: 'Netflix', title: 'Data Streaming Engineer', location: 'Los Gatos, CA', type: 'Full Time', lpa: 35, skills: ['Java', 'Kafka', 'Scala', 'AWS'] },
  { companyName: 'Stripe', title: 'Backend Software Engineer', location: 'Remote', type: 'Full Time', lpa: 40, skills: ['Ruby', 'Go', 'PostgreSQL', 'API Design'] },
  { companyName: 'Discord', title: 'Systems Engineer', location: 'San Francisco, CA', type: 'Full Time', lpa: 28, skills: ['Rust', 'C++', 'Networking', 'Linux'] },
  { companyName: 'Cybernetics Inc', title: 'Smart Contract Auditor', location: 'Remote', type: 'Freelance', lpa: 30, skills: ['Solidity', 'Web3', 'Cryptography', 'Ethereum'] },
  { companyName: 'Spotify', title: 'Machine Learning Intern', location: 'Stockholm, Sweden', type: 'Internship', lpa: 10, skills: ['Python', 'Data Science', 'SQL'] },
  { companyName: 'Airbnb', title: 'Frontend Team Lead', location: 'Remote', type: 'Full Time', lpa: 38, skills: ['React', 'TypeScript', 'Next.js', 'GraphQL'] },
  { companyName: 'Uber', title: 'Distributed Systems Architect', location: 'Seattle, WA', type: 'Full Time', lpa: 50, skills: ['Go', 'Kubernetes', 'Microservices', 'Cassandra'] },
  { companyName: 'Vercel', title: 'Developer Advocate', location: 'Remote', type: 'Full Time', lpa: 22, skills: ['JavaScript', 'Next.js', 'Public Speaking', 'Technical Writing'] },
  { companyName: 'TrustHire', title: 'MERN Stack Developer', location: 'New York, NY', type: 'Full Time', lpa: 18, skills: ['MongoDB', 'Express', 'React', 'Node.js'] },
  { companyName: 'OpenAI', title: 'Prompt Engineer', location: 'San Francisco, CA', type: 'Full Time', lpa: 26, skills: ['LLMs', 'NLP', 'Python', 'Critical Thinking'] },
  { companyName: 'Notion', title: 'Product Designer', location: 'Remote', type: 'Freelance', lpa: 15, skills: ['Figma', 'UI/UX', 'Wireframing', 'Prototyping'] },
  { companyName: 'Twitch', title: 'Video Infrastructure Engineer', location: 'Seattle, WA', type: 'Full Time', lpa: 32, skills: ['C++', 'Video Compression', 'Golang', 'AWS'] },
  { companyName: 'Twillio', title: 'Site Reliability Engineer', location: 'Remote', type: 'Full Time', lpa: 29, skills: ['Terraform', 'Kubernetes', 'Docker', 'AWS'] },
  { companyName: 'Coinbase', title: 'Blockchain Security Analyst', location: 'Remote', type: 'Full Time', lpa: 36, skills: ['Security', 'Blockchain', 'Node.js', 'Penetration Testing'] },
  { companyName: 'Tesla', title: 'Computer Vision Engineer', location: 'Palo Alto, CA', type: 'Full Time', lpa: 42, skills: ['C++', 'OpenCV', 'Deep Learning', 'PyTorch'] },
  { companyName: 'Shopify', title: 'Ruby on Rails Developer', location: 'Toronto, Canada', type: 'Part Time', lpa: 12, skills: ['Ruby', 'Rails', 'PostgreSQL', 'Redis'] },
  { companyName: 'Slack', title: 'Desktop Apps Engineer', location: 'Remote', type: 'Full Time', lpa: 27, skills: ['Electron', 'TypeScript', 'React', 'Node.js'] },
  { companyName: 'Figma', title: 'Graphics Performance Engineer', location: 'San Francisco, CA', type: 'Full Time', lpa: 34, skills: ['WebGL', 'WebAssembly', 'C++', 'Rust'] },
  { companyName: 'GitHub', title: 'Cloud Automation Intern', location: 'Remote', type: 'Internship', lpa: 8, skills: ['Bash', 'Python', 'GitHub Actions', 'Linux'] },
  { companyName: 'Zoom', title: 'VoIP Protocol Engineer', location: 'San Jose, CA', type: 'Full Time', lpa: 31, skills: ['C', 'C++', 'WebRTC', 'Networking'] },
  { companyName: 'Atlassian', title: 'Jira Plugin Developer', location: 'Sydney, Australia', type: 'Freelance', lpa: 14, skills: ['Java', 'Spring Boot', 'React'] },
  { companyName: 'DataDog', title: 'Observability Engineer', location: 'New York, NY', type: 'Full Time', lpa: 25, skills: ['Golang', 'Python', 'Data Analytics', 'Kafka'] },
  { companyName: 'Roblox', title: 'Game Engine Programmer', location: 'San Mateo, CA', type: 'Full Time', lpa: 33, skills: ['C++', 'Lua', '3D Math', 'Physics Engines'] },
  { companyName: 'Canva', title: 'Frontend Canvas Specialist', location: 'Remote', type: 'Part Time', lpa: 16, skills: ['JavaScript', 'Canvas API', 'React', 'Performance Tuning'] }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is critically missing from .env');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to Database safely.');

    let recruiter = await User.findOne({ email: 'seed-admin@trusthire.com' });
    if (!recruiter) {
      recruiter = await User.create({
        name: 'Seed Company Admin',
        email: 'seed-admin@trusthire.com',
        password: 'Password123!',
        role: 'Recruiter',
        trustScore: 99,
        subscriptionStatus: 'active'
      });
      console.log('Created distinct Seed Recruiter Entity.');
    }

    let insertedCount = 0;
    for (let job of sampleJobs) {
      await Job.create({
        recruiterId: recruiter._id,
        companyName: job.companyName,
        title: job.title,
        description: `We are incredibly excited to open up this ${job.title} role at ${job.companyName}. As a core member of our infrastructure strategy, you will be deeply focused on scaling our primary services leveraging ${job.skills.join(', ')}. We guarantee a highly competitive compensation package evaluated at ${job.lpa} LPA. Join our extremely fast-paced environment and take ownership over high-stakes products. Apply directly through the TrustHire escrow infrastructure to bypass standard keyword filters and instantly ping our hiring managers.`,
        skills: job.skills,
        location: job.location,
        challengeFee: Math.floor(Math.random() * 500) + 100, // random fee between 100 and 600
        employmentType: job.type,
        salaryLPA: job.lpa,
        status: 'Active'
      });
      insertedCount++;
    }

    console.log(`Successfully seeded ${insertedCount} precise job records!`);
    process.exit(0);
  } catch (error) {
    console.error('Failure seeding infrastructure:', error);
    process.exit(1);
  }
};

seedDB();
