# Profile Picture & Media Storage Guide

## Overview
The Amdox Jobs platform supports profile pictures and media for both **Job Seekers** and **Employers**. This document explains how profile pictures are stored and managed.

## Database Schema

### User Profile Fields (MongoDB)

```javascript
profile: {
  // Common Fields (Both Job Seekers & Employers)
  name: String,
  phone: String,
  photoURL: String,              // ✅ Profile picture URL
  bio: String (max 1000 chars),
  location: String,
  
  // Employer-Specific Fields
  company: String,
  website: String,
  industry: String,
  companySize: String,
  
  // Job Seeker-Specific Fields
  resumeURL: String,             // ✅ Resume file URL
  skills: [String],
  experience: String,
  education: String,
  
  // Social Links (Both)
  linkedin: String,
  github: String,
  portfolio: String
}
```

## Profile Picture Sources

### 1. **Google Authentication**
When users sign in with Google:
- **Job Seekers**: Google profile photo is stored in `photoURL`
- **Employers**: System attempts to fetch company logo via Clearbit API based on email domain

```javascript
// Example: hr@amdox.com
photoURL: "https://logo.clearbit.com/amdox.com"
```

### 2. **Manual Upload**
Users can upload custom profile pictures:
- **Storage Options**:
  - Base64 encoded (for small images < 500KB) - stored directly in MongoDB
  - External URL (Cloudinary, AWS S3, etc.)
  - File upload to server (requires implementation)

### 3. **Default/Placeholder**
If no photo is provided:
- Job Seekers: Default avatar icon
- Employers: Company building emoji or placeholder

## Current Implementation

### Backend (Node.js/Express)

**File**: `server/controllers/authController.js`
```javascript
// Auto-populate company logo for employers
if (userRole === 'employer') {
  const companyInfo = getCompanyInfo(emailLower);
  if (companyInfo) {
    newUserProfile.photoURL = companyInfo.logo; // Clearbit logo
  }
}
```

**File**: `server/controllers/userController.js`
```javascript
// Update profile including photoURL
exports.updateProfile = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, {
    $set: {
      'profile.photoURL': updates.photoURL,
      'profile.resumeURL': updates.resumeURL,
      // ... other fields
    }
  });
};
```

### Frontend (React)

**File**: `client/src/components/dashboard/EmployerCompanyProfile.jsx`
```javascript
// Upload logo as Base64
const handleLogoUpload = async (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64String = reader.result;
    await userService.updateProfile(user._id, { photoURL: base64String });
  };
  reader.readAsDataURL(file);
};
```

## API Endpoints

### Update Profile Picture
```http
PUT /api/users/:userId/profile
Content-Type: application/json

{
  "photoURL": "https://example.com/photo.jpg"
}
```

### Upload Profile Picture (Future Enhancement)
```http
POST /api/users/:userId/upload-photo
Content-Type: multipart/form-data

{
  "photo": <file>
}
```

## Storage Recommendations

### For Production:

1. **Cloudinary** (Recommended)
   - Free tier: 25GB storage
   - Automatic image optimization
   - CDN delivery
   - Image transformations

2. **AWS S3**
   - Scalable storage
   - Pay-as-you-go pricing
   - Requires AWS setup

3. **Firebase Storage**
   - Integrates with existing Firebase Auth
   - 5GB free tier
   - Easy to implement

### Current (Development):
- **Base64 in MongoDB**: For small images only (< 500KB)
- **External URLs**: Clearbit, Google Photos

## Security Considerations

1. **File Size Limits**: Max 500KB for Base64, 5MB for file uploads
2. **File Type Validation**: Only allow image formats (jpg, png, webp)
3. **Sanitization**: Clean filenames and validate URLs
4. **Access Control**: Users can only update their own profile pictures

## Future Enhancements

- [ ] Implement file upload to cloud storage (Cloudinary/S3)
- [ ] Add image cropping/resizing on frontend
- [ ] Support for multiple company photos (gallery)
- [ ] Video resume support for job seekers
- [ ] Company banner images

## Usage Examples

### Job Seeker Profile Picture
```javascript
// Display in UI
<img src={user.profile.photoURL || '/default-avatar.png'} alt="Profile" />
```

### Employer Company Logo
```javascript
// Display in UI
<img src={user.profile.photoURL || '🏢'} alt="Company Logo" />
```

## Testing

To test profile picture functionality:

1. **Google Sign-In**: Check if photo is auto-populated
2. **Company Email**: Verify Clearbit logo is fetched
3. **Manual Upload**: Test file upload in Company Profile page
4. **Update**: Ensure photoURL persists after profile updates

---

**Last Updated**: January 2026  
**Version**: 1.0.0
