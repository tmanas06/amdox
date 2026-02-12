<div align="center">
  <img src="client/logo/logo.png" alt="AMDox Jobs Logo" width="120" height="120">
  
  # AMDox Jobs
  
  ### Modern Job Portal Platform
  
  *Connecting talent with opportunity through innovative technology*
  
  [![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-16.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  
  [Live Demo](#) • [Documentation](#) • [Report Bug](#) • [Request Feature](#)
  
</div>

---

## 📸 Screenshots

<div align="center">
  
### Dashboard Overview
![Dashboard](screenshots/dashboard.png)
*Modern, intuitive dashboard with real-time job statistics and quick actions*

### Job Listings
![Job Listings](screenshots/job-listings.png)
*Advanced search and filtering with beautiful card-based layout*

### Dark Mode
![Dark Mode](screenshots/dark-mode.png)
*Seamless dark/light theme switching for comfortable viewing*

### Mobile Experience
![Mobile View](screenshots/mobile-view.png)
*Fully responsive design optimized for all devices*

</div>

---

## 🌟 Overview

AMDox Jobs is a full-stack job portal platform that revolutionizes the way job seekers and employers connect. Built with cutting-edge technologies and modern design principles, it provides an exceptional user experience for both candidates searching for their dream job and companies looking to hire top talent.

## ✨ Key Features

### For Job Seekers 🎯

- **Smart Job Discovery** - Browse thousands of curated job opportunities with intelligent recommendations
- **Advanced Search & Filters** - Find exactly what you're looking for with powerful filtering options
- **One-Click Applications** - Apply to jobs instantly with your saved profile
- **Application Tracking** - Monitor your application status in real-time
- **Save & Compare Jobs** - Bookmark interesting positions and compare them side-by-side
- **Personalized Dashboard** - Track your job search progress with visual analytics
- **Job Alerts** - Get notified when new jobs match your preferences

### For Employers 💼

- **Easy Job Posting** - Create and publish job listings in minutes
- **Applicant Management** - Review, filter, and manage candidates efficiently
- **Company Profile** - Showcase your company culture and values
- **Analytics Dashboard** - Track job performance and application metrics
- **Candidate Search** - Find and reach out to potential candidates
- **Team Collaboration** - Manage hiring pipeline with your team

### Platform Features 🚀

- **Modern UI/UX** - Beautiful, intuitive interface with glassmorphism design
- **Dark/Light Themes** - Seamless theme switching for comfortable viewing
- **Fully Responsive** - Perfect experience on desktop, tablet, and mobile
- **Real-time Updates** - Live notifications and instant data synchronization
- **Secure Authentication** - Firebase Auth with Google OAuth and email/password
- **Accessibility First** - WCAG compliant with keyboard navigation and screen reader support
- **Performance Optimized** - Fast loading with code splitting and lazy loading

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

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | 18.x |
| **React Router** | Navigation | 6.x |
| **Firebase Auth** | Authentication | Latest |
| **Axios** | HTTP Client | Latest |
| **React Toastify** | Notifications | Latest |
| **CSS3** | Styling | - |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime Environment | 16.x+ |
| **Express.js** | Web Framework | 4.x |
| **MongoDB** | Database | 6.x |
| **Mongoose** | ODM | Latest |
| **JWT** | Authentication | Latest |
| **bcrypt** | Password Hashing | Latest |

### DevOps & Tools
| Technology | Purpose |
|-----------|---------|
| **Vercel** | Hosting & Deployment |
| **MongoDB Atlas** | Cloud Database |
| **Git** | Version Control |
| **npm** | Package Management |

### Design System
- **Custom CSS Variables** - Consistent theming
- **Glassmorphism** - Modern UI aesthetic
- **Responsive Grid** - Mobile-first layout
- **CSS Animations** - Smooth transitions
- **Accessibility** - WCAG 2.1 AA compliant

## 📁 Project Structure

```
amdox-jobs/
├── 📂 client/                    # React Frontend
│   ├── 📂 public/               # Static assets
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   └── manifest.json
│   ├── 📂 src/
│   │   ├── 📂 components/       # Reusable components
│   │   │   ├── dashboard/      # Dashboard-specific components
│   │   │   ├── SkeletonLoader.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── MotionSafe.jsx
│   │   ├── 📂 pages/           # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── 📂 context/         # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── 📂 services/        # API services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── mockData.js
│   │   ├── 📂 styles/          # Global styles
│   │   │   ├── tokens.css      # Design tokens
│   │   │   ├── typography.css
│   │   │   ├── animations.css
│   │   │   └── accessibility.css
│   │   ├── 📂 hooks/           # Custom hooks
│   │   ├── 📂 utils/           # Utility functions
│   │   ├── 📂 firebase/        # Firebase config
│   │   └── 📂 __tests__/       # Test files
│   └── package.json
│
├── 📂 server/                   # Node.js Backend
│   ├── 📂 controllers/         # Business logic
│   │   ├── authController.js
│   │   └── jobController.js
│   ├── 📂 models/              # Database models
│   │   ├── User.js
│   │   └── Job.js
│   ├── 📂 routes/              # API routes
│   │   ├── auth.js
│   │   └── jobs.js
│   ├── 📂 middleware/          # Custom middleware
│   │   └── auth.js
│   ├── index.js                # Server entry point
│   └── package.json
│
├── 📂 screenshots/             # Application screenshots
├── 📂 .kiro/                   # Development specs
│   └── specs/
│       ├── modern-ui-redesign/
│       └── enhanced-job-features/
├── .gitignore
├── README.md
└── package.json
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v7.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/downloads)
- **Firebase Account** - [Create Account](https://firebase.google.com/)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/amdox-jobs.git
cd amdox-jobs
```

#### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp env.example.txt .env

# Configure your .env file with:
# - MongoDB connection string
# - JWT secret key
# - Port number (default: 5000)
```

**Environment Variables (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/amdox-jobs
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amdox-jobs

JWT_SECRET=your-super-secure-jwt-secret-key-change-this
PORT=5000
NODE_ENV=development
```

```bash
# Start the development server
npm run dev

# Server will run on http://localhost:5000
```

#### 3. Frontend Setup

```bash
# Open a new terminal and navigate to client directory
cd client

# Install dependencies
npm install

# Create environment file
cp env.example.txt .env

# Configure your .env file with Firebase credentials
```

**Environment Variables (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

```bash
# Start the development server
npm start

# Application will open at http://localhost:3000
```

### 4. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Google** and **Email/Password** authentication
5. Copy your Firebase configuration to the `.env` file

### 5. Database Setup (Optional)

If using local MongoDB:

```bash
# Start MongoDB service
mongod

# Or use MongoDB Compass for GUI management
```

If using MongoDB Atlas:
1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your IP address
4. Copy the connection string to your `.env` file

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

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register new user | No |
| `POST` | `/auth/login` | Login with email/password | No |
| `POST` | `/auth/firebase-login` | Login with Firebase/Google | No |
| `GET` | `/auth/me` | Get current user profile | Yes |
| `POST` | `/auth/logout` | Logout user | Yes |

### Job Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/jobs` | Get all jobs (with filters) | No |
| `GET` | `/jobs/:id` | Get job by ID | No |
| `POST` | `/jobs` | Create new job | Yes (Employer) |
| `PUT` | `/jobs/:id` | Update job | Yes (Employer) |
| `DELETE` | `/jobs/:id` | Delete job | Yes (Employer) |
| `GET` | `/jobs/employer/my-jobs` | Get employer's jobs | Yes (Employer) |
| `POST` | `/jobs/:id/apply` | Apply to job | Yes (Job Seeker) |

### Application Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/applications/me` | Get user's applications | Yes |
| `GET` | `/jobs/:id/applications` | Get job applications | Yes (Employer) |
| `PATCH` | `/applications/:id/status` | Update application status | Yes (Employer) |

### Query Parameters (GET /jobs)

```javascript
{
  search: "developer",        // Search in title, company, skills
  location: "San Francisco",  // Filter by location
  type: "Full-time",         // Filter by job type
  remote: "true",            // Filter remote jobs
  page: 1,                   // Pagination page number
  limit: 10                  // Results per page
}
```

### Request Examples

**Register User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "job_seeker"
}
```

**Create Job Posting**
```bash
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior Frontend Developer",
  "company": "TechCorp",
  "location": "San Francisco, CA",
  "type": "Full-time",
  "salary": "$120k - $160k",
  "description": "We are looking for...",
  "requirements": ["React", "TypeScript", "5+ years experience"],
  "isRemote": true
}
```

**Search Jobs**
```bash
GET /api/jobs?search=react&location=remote&type=Full-time&page=1&limit=10
```

## � Usage Guide

### For Job Seekers

1. **Create Account**
   - Sign up using Google OAuth or email/password
   - Complete your profile with skills and experience

2. **Browse Jobs**
   - Navigate to the Jobs tab
   - Use search and filters to find relevant positions
   - View detailed job descriptions

3. **Apply to Jobs**
   - Click "Apply Now" on any job listing
   - Track application status in the Applications tab
   - Save interesting jobs for later review

4. **Manage Applications**
   - View all your applications in one place
   - Track application status (Applied, Under Review, Interview, etc.)
   - Receive notifications for updates

### For Employers

1. **Company Setup**
   - Register as an employer
   - Complete your company profile
   - Add company logo and description

2. **Post Jobs**
   - Click "Post a Job" from the dashboard
   - Fill in job details (title, description, requirements)
   - Set salary range and job type
   - Publish immediately or save as draft

3. **Manage Applications**
   - Review candidate applications
   - Filter and sort applicants
   - Update application status
   - Contact candidates directly

4. **Analytics**
   - View job posting performance
   - Track application metrics
   - Monitor hiring pipeline

## � Deployment

### Deploy to Vercel (Recommended)

#### Frontend Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com/)
   - Import your GitHub repository
   - Select the `client` directory as root
   - Configure environment variables

3. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-api-domain.com/api
   REACT_APP_FIREBASE_API_KEY=your-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

#### Backend Deployment

1. **Prepare Backend**
   ```bash
   cd server
   npm run build  # If you have a build script
   ```

2. **Deploy to Vercel**
   - Create a new project for the backend
   - Select the `server` directory
   - Add environment variables:
     ```
     MONGODB_URI=your-mongodb-atlas-uri
     JWT_SECRET=your-production-secret
     NODE_ENV=production
     ```

3. **Alternative: Deploy to Heroku**
   ```bash
   # Install Heroku CLI
   heroku login
   heroku create amdox-jobs-api
   
   # Set environment variables
   heroku config:set MONGODB_URI=your-uri
   heroku config:set JWT_SECRET=your-secret
   
   # Deploy
   git push heroku main
   ```

### MongoDB Atlas Setup

1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist IP addresses (0.0.0.0/0 for all IPs)
4. Get connection string
5. Add to environment variables

### Post-Deployment Checklist

- [ ] Test all authentication flows
- [ ] Verify API endpoints are working
- [ ] Check database connections
- [ ] Test job posting and application features
- [ ] Verify email notifications (if configured)
- [ ] Test on multiple devices and browsers
- [ ] Set up monitoring and error tracking
- [ ] Configure custom domain (optional)

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
cd client
npm test                    # Run all tests
npm test -- --coverage     # Run with coverage report
npm test -- --watch        # Run in watch mode

# Backend tests
cd server
npm test                    # Run all tests
npm run test:watch         # Run in watch mode
```

### Test Structure

```
client/src/
├── __tests__/
│   ├── integration/       # Integration tests
│   ├── visual/           # Visual regression tests
│   └── unit/             # Unit tests
└── styles/__tests__/     # Style validation tests
```

### Writing Tests

```javascript
// Example component test
import { render, screen } from '@testing-library/react';
import Jobs from './Jobs';

test('renders job listings', () => {
  render(<Jobs />);
  const heading = screen.getByText(/Find Your Dream Job/i);
  expect(heading).toBeInTheDocument();
});
```

## 🔒 Security

### Best Practices Implemented

- ✅ **JWT Authentication** - Secure token-based auth with expiration
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **Input Validation** - Server-side validation for all inputs
- ✅ **CORS Configuration** - Restricted cross-origin requests
- ✅ **Environment Variables** - Sensitive data stored securely
- ✅ **HTTPS Only** - All production traffic encrypted
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **SQL Injection Prevention** - Mongoose ODM protection
- ✅ **XSS Protection** - Input sanitization

### Security Recommendations

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Enable 2FA** for admin accounts
4. **Regular dependency updates** to patch vulnerabilities
5. **Monitor logs** for suspicious activity
6. **Implement rate limiting** on authentication endpoints
7. **Use HTTPS** in production
8. **Regular security audits**

```bash
# Check for vulnerabilities
npm audit
npm audit fix

# Update dependencies
npm update
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help make AMDox Jobs better:

### How to Contribute

1. **Fork the Repository**
   ```bash
   # Click the 'Fork' button on GitHub
   git clone https://github.com/your-username/amdox-jobs.git
   cd amdox-jobs
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-fix
   ```

3. **Make Your Changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test Your Changes**
   ```bash
   # Run tests
   npm test
   
   # Check for linting errors
   npm run lint
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   
   **Commit Message Convention:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting)
   - `refactor:` Code refactoring
   - `test:` Adding or updating tests
   - `chore:` Maintenance tasks

6. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes in detail
   - Link any related issues

### Development Guidelines

- **Code Style**: Follow the existing code style and conventions
- **Testing**: Write tests for new features
- **Documentation**: Update README and comments
- **Commits**: Use clear, descriptive commit messages
- **Pull Requests**: Keep PRs focused on a single feature/fix

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements
- 🌐 Internationalization
- 🧪 Test coverage
- ⚡ Performance optimizations

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## � Troubleshooting

### Common Issues and Solutions

#### Frontend Issues

**Issue: App won't start**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

**Issue: Firebase authentication not working**
- Verify Firebase configuration in `.env`
- Check if authentication methods are enabled in Firebase Console
- Ensure API keys are correct

**Issue: API calls failing**
- Check if backend server is running
- Verify `REACT_APP_API_URL` in `.env`
- Check browser console for CORS errors

#### Backend Issues

**Issue: MongoDB connection failed**
```bash
# Check MongoDB is running
mongod --version

# Verify connection string in .env
# For local: mongodb://localhost:27017/amdox-jobs
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/amdox-jobs
```

**Issue: JWT authentication errors**
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration settings
- Verify Authorization header format: `Bearer <token>`

**Issue: Port already in use**
```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in .env
```

### Getting Help

- 📖 Check the [Documentation](#)
- 💬 Join our [Discord Community](#)
- 🐛 Report bugs in [GitHub Issues](https://github.com/yourusername/amdox-jobs/issues)
- 📧 Email: support@amdoxjobs.com

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 AMDox Jobs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## 👥 Authors & Contributors

### Core Team

- **Your Name** - *Lead Developer* - [@yourusername](https://github.com/yourusername)

### Contributors

Thanks to all the amazing people who have contributed to this project! 🎉

<a href="https://github.com/yourusername/amdox-jobs/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yourusername/amdox-jobs" />
</a>

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Firebase** - For authentication services
- **MongoDB** - For the flexible database
- **Vercel** - For seamless deployment
- **Open Source Community** - For inspiration and support

## 📞 Contact & Support

- **Website**: [amdoxjobs.com](#)
- **Email**: support@amdoxjobs.com
- **Twitter**: [@amdoxjobs](#)
- **LinkedIn**: [AMDox Jobs](#)
- **Discord**: [Join our community](#)

## 🗺 Roadmap

### Q1 2024
- [ ] Advanced job filters (salary range, experience level)
- [ ] Job detail pages with apply functionality
- [ ] Company profile pages
- [ ] Job comparison feature

### Q2 2024
- [ ] Resume builder
- [ ] Application tracking with visual pipeline
- [ ] Chat/messaging system
- [ ] Mobile app (React Native)

### Q3 2024
- [ ] AI-powered job recommendations
- [ ] Video interview integration
- [ ] Skill assessments
- [ ] Analytics dashboard

### Q4 2024
- [ ] Multi-language support
- [ ] Advanced search with Elasticsearch
- [ ] Social features (referrals, reviews)
- [ ] Enterprise features

---

<div align="center">
  
  ### ⭐ Star us on GitHub — it motivates us a lot!
  
  Made with ❤️ by the AMDox Team
  
  **[⬆ Back to Top](#amdox-jobs)**
  
</div>