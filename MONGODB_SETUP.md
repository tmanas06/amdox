# MongoDB Setup Guide for AMDox

## Understanding MongoDB vs SQL Databases

### Key Differences:

| SQL (MySQL, PostgreSQL) | MongoDB (NoSQL) |
|------------------------|-----------------|
| Uses **Tables** | Uses **Collections** |
| Uses **Rows** | Uses **Documents** |
| Fixed schema (columns) | Flexible schema (fields) |
| Relational (joins) | Document-based (embedded) |

### In This Project:

- **Database Name**: `amdox` (or whatever you name it)
- **Collection Name**: `users` (automatically created from User model)
- **Documents**: Each user account is a document in the `users` collection

## MongoDB Structure in This Project

### Database: `amdox`
```
amdox/
└── users (collection)
    ├── Document 1: { _id, email, role, firebaseUid, password, profile: {...}, createdAt, updatedAt }
    ├── Document 2: { _id, email, role, firebaseUid, password, profile: {...}, createdAt, updatedAt }
    └── Document 3: { ... }
```

### User Document Structure:
```javascript
{
  _id: ObjectId("..."),              // Auto-generated unique ID
  email: "user@example.com",        // Unique, required
  role: "job_seeker",               // "job_seeker" or "employer"
  firebaseUid: "firebase-uid-123",  // Unique (if using Firebase)
  password: "$2a$10$hashed...",     // Hashed password (if email/password)
  profile: {
    name: "John Doe",
    phone: "+1234567890",
    photoURL: "https://...",
    bio: "Software developer...",
    company: "Tech Corp",
    location: "New York"
  },
  createdAt: ISODate("2024-01-01T..."),  // Auto-added
  updatedAt: ISODate("2024-01-01T...")   // Auto-updated
}
```

## Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended for Beginners)

**MongoDB Atlas** is a free cloud database service. Perfect for development!

#### Steps:

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free (M0 tier is free forever)

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "M0 FREE" tier
   - Select a cloud provider (AWS, Google Cloud, or Azure)
   - Choose a region closest to you
   - Click "Create"

3. **Set Up Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (SAVE THESE!)
   - Set privileges to "Atlas admin" (for development)
   - Click "Add User"

4. **Set Up Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add only your server's IP address
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Update Your .env File**
   - Open `server/.env` (create from `env.example.txt` if needed)
   - Replace the connection string:
     ```env
     MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/amdox?retryWrites=true&w=majority
     ```
   - Replace:
     - `yourusername` with your database username
     - `yourpassword` with your database password
     - `amdox` is the database name (you can change this)

7. **Test Connection**
   - Start your server: `cd server && npm start`
   - You should see: `MongoDB Connected: cluster0.xxxxx.mongodb.net`

### Option 2: Local MongoDB Installation

If you prefer running MongoDB on your computer:

#### Windows:

1. **Download MongoDB**
   - Go to https://www.mongodb.com/try/download/community
   - Download Windows installer
   - Run installer (choose "Complete" installation)

2. **Install MongoDB as a Service**
   - During installation, check "Install MongoDB as a Service"
   - MongoDB will start automatically

3. **Verify Installation**
   - Open Command Prompt
   - Run: `mongod --version`
   - Should show MongoDB version

4. **Update Your .env File**
   ```env
   MONGODB_URI=mongodb://localhost:27017/amdox
   ```

5. **Start MongoDB** (if not running as service)
   ```bash
   mongod
   ```

#### macOS:

1. **Install using Homebrew**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB**
   ```bash
   brew services start mongodb-community
   ```

3. **Update Your .env File**
   ```env
   MONGODB_URI=mongodb://localhost:27017/amdox
   ```

#### Linux (Ubuntu/Debian):

1. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb
   ```

2. **Start MongoDB**
   ```bash
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

3. **Update Your .env File**
   ```env
   MONGODB_URI=mongodb://localhost:27017/amdox
   ```

## How Mongoose Works

Mongoose is a library that connects Node.js to MongoDB. Here's how it works:

### 1. Schema Definition (`server/models/User.js`)
```javascript
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['job_seeker', 'employer'] },
  // ... more fields
});
```
- Defines the **structure** of documents
- Sets validation rules
- Creates indexes for faster queries

### 2. Model Creation
```javascript
const User = mongoose.model('User', userSchema);
```
- `'User'` → MongoDB automatically creates collection `users` (plural, lowercase)
- This model is used to interact with the database

### 3. Connection (`server/index.js`)
```javascript
mongoose.connect(process.env.MONGODB_URI);
```
- Connects to MongoDB database
- Creates database if it doesn't exist

### 4. Using the Model (in controllers)
```javascript
// Create a user
const user = new User({ email: 'test@example.com', role: 'job_seeker' });
await user.save();

// Find a user
const user = await User.findOne({ email: 'test@example.com' });

// Update a user
user.profile.name = 'John Doe';
await user.save();
```

## Viewing Your Data

### Option 1: MongoDB Atlas Web Interface
- Go to your cluster in MongoDB Atlas
- Click "Browse Collections"
- See all your data in a nice UI

### Option 2: MongoDB Compass (Desktop App)
- Download: https://www.mongodb.com/products/compass
- Connect using your connection string
- Browse databases and collections visually

### Option 3: Command Line (mongosh)
```bash
# Connect to local MongoDB
mongosh

# Or connect to Atlas
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/amdox"

# Use database
use amdox

# View collections
show collections

# View users
db.users.find().pretty()

# Count users
db.users.countDocuments()

# Find specific user
db.users.findOne({ email: "test@example.com" })
```

## Common Operations

### Creating a User (Automatic)
When a user registers or signs in with Google, a document is automatically created:
```javascript
// In authController.js
const user = new User({
  email: 'user@example.com',
  role: 'job_seeker',
  firebaseUid: 'firebase-123',
  profile: { name: 'John Doe' }
});
await user.save(); // Creates document in 'users' collection
```

### Querying Users
```javascript
// Find all users
const users = await User.find();

// Find by email
const user = await User.findOne({ email: 'user@example.com' });

// Find by role
const jobSeekers = await User.find({ role: 'job_seeker' });

// Find with conditions
const users = await User.find({ 
  'profile.location': 'New York',
  role: 'employer'
});
```

### Updating Users
```javascript
// Update one field
user.profile.name = 'Jane Doe';
await user.save();

// Update multiple fields
await User.updateOne(
  { email: 'user@example.com' },
  { $set: { 'profile.company': 'New Company' } }
);
```

## Environment Variables

Your `server/.env` file should look like:
```env
# MongoDB Connection
# For Atlas (Cloud):
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/amdox?retryWrites=true&w=majority

# For Local:
# MONGODB_URI=mongodb://localhost:27017/amdox

# Other settings
PORT=5000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

## Troubleshooting

### Connection Error: "MongoServerError: bad auth"
- Check username and password in connection string
- Make sure database user has proper permissions

### Connection Error: "MongoNetworkError"
- Check if MongoDB is running (for local)
- Check network access settings (for Atlas)
- Verify connection string is correct

### "Collection doesn't exist"
- MongoDB creates collections automatically when you save the first document
- This is normal! The collection will appear after first user registration

### Database not found
- MongoDB creates the database automatically when you save the first document
- The database name comes from your connection string (e.g., `amdox`)

## Summary

1. **Choose setup method**: Atlas (cloud) or Local
2. **Get connection string**: From Atlas or use `mongodb://localhost:27017/amdox`
3. **Update `.env` file**: Add `MONGODB_URI` with your connection string
4. **Start server**: MongoDB connection happens automatically
5. **Data is created**: When users register, documents are saved to `users` collection

The database and collections are created automatically when you first save data - no manual setup needed!
