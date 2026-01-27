# AMDox - Job Listing Portal

A hybrid authentication system for a job listing portal with Firebase Google Sign-In and email/password authentication.

## Features

- **Hybrid Authentication**: Support for both Firebase Google Sign-In and email/password authentication
- **User Roles**: Job seekers and employers
- **JWT-based API Protection**: Secure API endpoints with JWT tokens
- **User Profiles**: Extended user profile with name, phone, photo, bio, company, and location

## Project Structure

```bash
amdox/
├── server/                 # Backend (Node.js + Express + Mongoose)
│   ├── models/
│   │   └── User.js        # User model schema
│   ├── controllers/
│   │   └── authController.js  # Authentication logic
│   ├── routes/
│   │   └── auth.js        # Authentication routes
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   ├── index.js           # Express server setup
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variables template
│
└── client/                # Frontend (React + Firebase)
    └── src/
        ├── firebase/
        │   └── config.js      # Firebase configuration
        ├── services/
        │   └── authService.js # API service for authentication
        ├── context/
        │   └── AuthContext.jsx # Auth state management
        ├── components/
        │   └── ProtectedRoute.jsx # Route protection component
        ├── pages/
        │   ├── LoginPage.jsx     # Login page
        │   ├── LoginPage.css
        │   ├── RegisterPage.jsx  # Registration page
        │   └── RegisterPage.css
        ├── package.json          # Frontend dependencies
        └── .env.example          # Environment variables template
```

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Adjust `PORT` if needed (default: 5000)

5. Start the server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   - Set `REACT_APP_API_URL` to your backend API URL (default: http://localhost:5000/api)
   - Add your Firebase project credentials:
     - `REACT_APP_FIREBASE_API_KEY`
     - `REACT_APP_FIREBASE_AUTH_DOMAIN`
     - `REACT_APP_FIREBASE_PROJECT_ID`
     - `REACT_APP_FIREBASE_STORAGE_BUCKET`
     - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
     - `REACT_APP_FIREBASE_APP_ID`

5. Start the development server:
   ```bash
   npm start
   ```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Google" sign-in provider
   - Configure OAuth consent screen if needed
4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Copy the Firebase configuration object
   - Update your `.env` file with these values

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/firebase-login` - Firebase authentication
  - Body: `{ firebaseUid, email, name, photoURL, role? }`
  - Returns: `{ success, token, user }`

- `POST /api/auth/register` - Email/password registration
  - Body: `{ email, password, confirmPassword, role?, name?, phone? }`
  - Returns: `{ success, token, user }`

- `POST /api/auth/login` - Email/password login
  - Body: `{ email, password }`
  - Returns: `{ success, token, user }`

- `GET /api/auth/me` - Get current user (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ success, user }`

## Usage Examples

### Using Auth Context in React Components

```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout, signInWithGoogle } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={signInWithGoogle}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome, {user.profile.name || user.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting Routes

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### Using Auth Middleware in Backend

```javascript
const { authenticateToken, authorizeRole } = require('./middleware/auth');

// Protect route with authentication
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Protect route with role-based authorization
router.get('/employer-only', 
  authenticateToken, 
  authorizeRole('employer'), 
  (req, res) => {
    res.json({ message: 'Employer access granted' });
  }
);
```

## Deployment Architecture
```bash
GitHub Repository
    ↓ (push to main)
GitHub Actions
    ↓
┌─────────────┬─────────────┐
│   Backend   │  Frontend   │
│   Vercel    │   Vercel    │
└──────┬──────┴──────┬───────┘
       │            │
       └─────┬──────┘
             ↓
      MongoDB Atlas
```

## Security Notes

- Always use HTTPS in production
- Keep JWT_SECRET secure and never commit it to version control
- Use strong passwords and implement rate limiting in production
- Validate all user inputs on both client and server
- Implement CSRF protection for production deployments
- Regularly update dependencies for security patches




4.2 Batch :

Job Application
Job seekers can apply 
for jobs directly through 
the portal.
Employers can view 
applications and 
manage candidates

Job Search
Simple search 
functionality for job 
seekers to find listings.
Basic search filters such 
as job type, location, and 
keyword.