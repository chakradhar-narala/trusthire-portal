const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Job = require('./models/Job');
const User = require('./models/User');

dotenv.config();

const updateDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);

    const email = 'naralachakradharreddy@gmail.com';
    let targetUser = await User.findOne({ email });

    if (!targetUser) {
      targetUser = await User.create({
        name: 'Chakradhar Reddy',
        email: email,
        password: 'Narala@2003',
        role: 'Recruiter',
        trustScore: 100,
        subscriptionStatus: 'active'
      });
      console.log('Created User: ' + email);
    } else {
      console.log('User ' + email + ' already exists. Ensuring they are a Recruiter.');
      targetUser.role = 'Recruiter';
      targetUser.subscriptionStatus = 'active';
      targetUser.trustScore = 100;
      await targetUser.save();
    }

    const previousAdmin = await User.findOne({ email: 'seed-admin@trusthire.com' });
    let jobsUpdated = 0;
    
    if (previousAdmin) {
      const result = await Job.updateMany({ recruiterId: previousAdmin._id }, { $set: { recruiterId: targetUser._id } });
      jobsUpdated = result.modifiedCount;
    }

    if (jobsUpdated === 0) {
        // Fallback: Just update ALL active seed jobs to belong to this user if previousAdmin was somehow deleted
        const fallbackResult = await Job.updateMany({}, { $set: { recruiterId: targetUser._id } });
        jobsUpdated = fallbackResult.modifiedCount;
    }

    console.log(`Successfully mapped ${jobsUpdated} jobs to ${email}!`);
    process.exit(0);

  } catch (error) {
    console.error('Failed processing override:', error);
    process.exit(1);
  }
};

updateDB();
