# AMDox Jobs - Modern Job Portal Platform

AMDox Jobs is a comprehensive job listing platform that connects talented professionals with exciting career opportunities. Built with modern web technologies, it offers a seamless experience for both job seekers and employers.

## 🌟 What Makes AMDox Special

**For Job Seekers:**
- Browse thousands of job opportunities across various industries
- Save interesting positions for later review
- Apply to jobs with a single click
- Track your application status in real-time
- Create a professional profile that stands out

**For Employers:**
- Post job openings with detailed descriptions
- Manage applications efficiently
- Find the perfect candidates for your team
- Access a pool of qualified professionals
- Streamline your hiring process

## 🚀 Key Features

### Modern Authentication System
- **Quick Google Sign-In**: Get started in seconds with your Google account
- **Secure Email Registration**: Traditional email and password authentication
- **Role-Based Access**: Separate experiences for job seekers and employers
- **Profile Management**: Comprehensive user profiles with photos, bio, and contact information

### Advanced Job Management
- **Smart Job Search**: Find opportunities that match your skills and interests
- **Real-Time Applications**: Apply instantly and track your progress
- **Saved Jobs**: Bookmark positions to review later
- **Application History**: Keep track of all your job applications

### Beautiful User Experience
- **Modern Design**: Clean, intuitive interface that's a pleasure to use
- **Mobile Responsive**: Perfect experience on any device
- **Dark/Light Themes**: Choose the theme that works best for you
- **Accessibility First**: Built with accessibility standards in mind

## 🛠 Technology Stack

### Frontend (React Application)
- **React 18** - Modern UI library with hooks and context
- **Firebase Authentication** - Secure Google OAuth integration
- **Responsive Design** - Mobile-first approach with CSS Grid and Flexbox
- **Modern CSS** - Custom design system with CSS variables and animations

### Backend (Node.js API)
- **Express.js** - Fast and minimal web framework
- **MongoDB** - Flexible NoSQL database for user and job data
- **JWT Authentication** - Secure token-based authentication
- **RESTful API** - Clean and predictable API endpoints

### Infrastructure
- **Vercel Deployment** - Fast and reliable hosting for both frontend and backend
- **MongoDB Atlas** - Cloud database with automatic scaling
- **GitHub Actions** - Automated testing and deployment pipeline

## 📁 Project Structure

```
amdox-jobs/
├── client/                    # React Frontend Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Main application pages
│   │   ├── context/          # React context for state management
│   │   ├── services/         # API communication services
│   │   ├── styles/           # CSS and styling files
│   │   └── firebase/         # Firebase configuration
│   └── public/               # Static assets
│
├── server/                   # Node.js Backend API
│   ├── controllers/          # Business logic handlers
│   ├── models/              # Database schemas
│   ├── routes/              # API route definitions
│   ├── middleware/          # Authentication and validation
│   └── index.js             # Server entry point
│
└── docs/                    # Documentation and guides
```

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **MongoDB** database (local or cloud)
- **Firebase** project for authentication

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/amdox-jobs.git
cd amdox-jobs
```

### 2. Set Up the Backend
```bash
cd server
npm install

# Create environment configuration
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start the development server
npm run dev
```

### 3. Set Up the Frontend
```bash
cd client
npm install

# Create environment configuration
cp .env.example .env
# Edit .env with your Firebase credentials and API URL

# Start the development server
npm start
```

### 4. Configure Firebase Authentication

1. Visit the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication with Google sign-in
4. Copy your Firebase configuration to the `.env` file

Your application will be running at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/amdox-jobs
JWT_SECRET=your-super-secure-jwt-secret-key
PORT=5000
NODE_ENV=development
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase configuration
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/firebase-login` | Authenticate with Firebase/Google |
| POST | `/api/auth/register` | Register with email and password |
| POST | `/api/auth/login` | Login with email and password |
| GET | `/api/auth/me` | Get current user profile |

### Job Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all job listings |
| POST | `/api/jobs` | Create a new job posting |
| GET | `/api/jobs/:id` | Get specific job details |
| PUT | `/api/jobs/:id` | Update job posting |
| DELETE | `/api/jobs/:id` | Delete job posting |

## 🎨 Using the Application

### For Job Seekers

1. **Sign Up**: Create an account using Google or email
2. **Complete Profile**: Add your skills, experience, and preferences
3. **Browse Jobs**: Explore available opportunities
4. **Apply**: Submit applications with one click
5. **Track Progress**: Monitor your application status

### For Employers

1. **Create Account**: Sign up as an employer
2. **Company Profile**: Set up your company information
3. **Post Jobs**: Create detailed job descriptions
4. **Manage Applications**: Review and respond to candidates
5. **Find Talent**: Connect with qualified professionals

## 🚀 Deployment

### Production Deployment on Vercel

1. **Prepare for Production**
   ```bash
   # Build the frontend
   cd client && npm run build
   
   # Test the backend
   cd server && npm test
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Deploy with automatic CI/CD pipeline

3. **Database Setup**
   - Use MongoDB Atlas for production database
   - Configure connection string in environment variables
   - Set up database indexes for optimal performance

## 🔒 Security Best Practices

- **Authentication**: Secure JWT tokens with proper expiration
- **Data Validation**: Input validation on both client and server
- **HTTPS Only**: All production traffic uses SSL/TLS encryption
- **Environment Variables**: Sensitive data stored securely
- **Rate Limiting**: API endpoints protected against abuse
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the Repository**
2. **Create a Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Your Changes**: Follow our coding standards
4. **Test Thoroughly**: Ensure all tests pass
5. **Submit a Pull Request**: Describe your changes clearly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Need help? We're here for you:

- **Documentation**: Check our comprehensive guides
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join community discussions
- **Email**: Contact us at support@amdoxjobs.com

---

**Built with ❤️ by the AMDox Team**

*Connecting talent with opportunity, one job at a time.*