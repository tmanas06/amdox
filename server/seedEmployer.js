const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

async function seedEmployer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'employer@example.com';
        const password = 'password123';

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            console.log('Employer user already exists. Updating password...');
        } else {
            console.log('Creating new employer user...');
            user = new User({ email });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.role = 'employer';
        user.profile = {
            name: 'Example Employer',
            company: 'Amdox Corp',
            location: 'New York, USA'
        };

        await user.save();
        console.log('Employer user seeded successfully');
        console.log('Email: ' + email);
        console.log('Password: ' + password);

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedEmployer();
