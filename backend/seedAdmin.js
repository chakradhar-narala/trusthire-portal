require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        let admin = await User.findOne({ email: 'admin@trusthire.com' });
        
        if (admin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }
        
        admin = await User.create({
            name: 'System Admin',
            email: 'admin@trusthire.com',
            password: 'adminPassword123!',
            role: 'Admin',
            trustScore: 1000
        });
        
        console.log('Admin user successfully generated!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
