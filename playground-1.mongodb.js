// // List all databases
// db.adminCommand('listDatabases');

// // List all collections in the current database
// db.getCollectionNames();

// // Check if the database exists
// db.getMongo().getDBs()

// use('amdox');
// // db.getCollectionNames();

// // Example: Check if 'jobs' collection exists
// db.getCollection('jobs').findOne();
// // or
// db.jobs.find().limit(5);



// creation stuff
// use('amdox');

// db.jobs.insertMany([
//   {
//     title: 'Senior Full Stack Developer',
//     company: 'Tech Corp India',
//     logo: 'https://logo.clearbit.com/techcorp.com',
//     location: 'Bangalore',
//     type: 'Full-time',
//     salary: '₹15-25 LPA',
//     posted: '2 days ago',
//     description: 'We are looking for an experienced Full Stack Developer...',
//     skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
//     experience: '3-5 years',
//     jobId: 'TCI-FS-001',
//     isRemote: false,
//     companySize: '501-1000',
//     industry: 'Information Technology',
//     benefits: ['Health Insurance', 'Flexible Hours', 'WFH Options']
//   }
//   // Add more job objects as needed
// ]);


// In MongoDB playground (select your DB)
db.getCollection('applications').find({}).sort({ createdAt: -1 }).limit(10);

db.getCollection('jobs').find(
  { applications: { $exists: true, $ne: [] } },
  { title: 1, applications: 1 }
).limit(5);

db.getCollection('users').find(
  { "jobSeeker.applications": { $exists: true, $ne: [] } },
  { email: 1, role: 1, "jobSeeker.applications": 1 }
).limit(5);