
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedJobSeekers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const jobSeekers = [
            {
                email: 'alice@gmail.com',
                password: 'password123',
                role: 'job_seeker',
                profile: {
                    name: 'Alice Johnson',
                    headline: 'Senior React Developer',
                    skills: ['React', 'Node.js', 'Redux', 'TypeScript'],
                    experience: [{ title: 'Frontend Lead', company: 'WebTech Inc', description: 'Led a team of 5 devs' }]
                }
            },
            {
                email: 'bob@gmail.com',
                password: 'password123',
                role: 'job_seeker',
                profile: {
                    name: 'Bob Smith',
                    headline: 'Backend Engineer',
                    skills: ['Node.js', 'MongoDB', 'PostgreSQL', 'Docker'],
                    experience: [{ title: 'Backend Dev', company: 'DataSystems', description: 'Built scalable APIs' }]
                }
            },
            {
                email: 'charlie@gmail.com',
                password: 'password123',
                role: 'job_seeker',
                profile: {
                    name: 'Charlie Brown',
                    headline: 'Full Stack Developer',
                    skills: ['MERN Stack', 'AWS', 'GraphQL'],
                    experience: [{ title: 'Junior Dev', company: 'StartupHub', description: 'Implemented core features' }]
                }
            }
        ];

        for (const seeker of jobSeekers) {
            const existing = await User.findOne({ email: seeker.email });
            if (existing) {
                console.log(`User ${seeker.email} already exists`);
                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(seeker.password, salt);

            await User.create({
                ...seeker,
                password: hashedPassword
            });
            console.log(`Created job seeker: ${seeker.email}`);
        }

        console.log('Job seeker seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding job seekers:', error);
        process.exit(1);
    }
};

seedJobSeekers();
