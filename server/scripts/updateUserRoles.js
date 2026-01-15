/**
 * Script to update user roles based on email domain
 * Run this once to fix existing users who were created before the role detection logic
 * 
 * Usage: node scripts/updateUserRoles.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const determineRole = (email) => {
  const emailDomain = email.toLowerCase().split('@')[1];
  
  // If email is NOT @gmail.com, set as employer (company email)
  if (emailDomain && emailDomain !== 'gmail.com') {
    return 'employer';
  }
  
  // Default to job_seeker for @gmail.com emails
  return 'job_seeker';
};

const updateUserRoles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users`);

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      const email = user.email;
      if (!email) {
        console.log(`⚠️  Skipping user ${user._id} - no email`);
        skipped++;
        continue;
      }

      const correctRole = determineRole(email);
      const emailDomain = email.toLowerCase().split('@')[1];

      if (user.role !== correctRole) {
        console.log(`\n🔄 Updating user: ${email}`);
        console.log(`   Current role: ${user.role}`);
        console.log(`   Domain: ${emailDomain}`);
        console.log(`   New role: ${correctRole}`);

        user.role = correctRole;
        await user.save();
        updated++;
      } else {
        console.log(`✓ User ${email} already has correct role: ${user.role}`);
        skipped++;
      }
    }

    console.log(`\n✅ Update complete!`);
    console.log(`   Updated: ${updated} users`);
    console.log(`   Skipped: ${skipped} users`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateUserRoles();
