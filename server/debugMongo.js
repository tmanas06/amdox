
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
require('dotenv').config();

const debugMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        // Count documents
        const userCount = await User.countDocuments();
        const jobSeekerCount = await User.countDocuments({ role: 'job_seeker' });
        const employerCount = await User.countDocuments({ role: 'employer' });
        const jobCount = await Job.countDocuments();
        const appCount = await Application.countDocuments();

        console.log('--- Stats ---');
        console.log(`Total Users: ${userCount}`);
        console.log(`Job Seekers: ${jobSeekerCount}`);
        console.log(`Employers: ${employerCount}`);
        console.log(`Jobs: ${jobCount}`);
        console.log(`Applications: ${appCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugMongo();
