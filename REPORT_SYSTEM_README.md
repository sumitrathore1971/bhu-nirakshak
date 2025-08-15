# Land Encroachment Report System

## Overview

This document describes the complete implementation of a MongoDB-based land encroachment report system for the Bhu-Nirakshak Citizen Portal. The system allows citizens to submit reports, track their status, and provides administrative tools for managing reports.

## Architecture

### Backend (Node.js + Express + MongoDB)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with role-based access control
- **API**: RESTful API with comprehensive validation and error handling

### Frontend (React.js)
- **Framework**: React with Vite
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: React hooks and context
- **Animations**: Framer Motion for smooth transitions

## Database Schema

### Report Model (`backend/src/models/Report.js`)

```javascript
{
  // Report identification
  reportId: String (unique, auto-generated: BN-YYYY-XXXX)
  
  // Reporter information
  reporter: {
    userId: ObjectId (ref: User),
    fullName: String,
    phone: String (10 digits),
    email: String (optional)
  }
  
  // Encroachment details
  title: String,
  description: String,
  category: Enum ['Public Land', 'Private Land', 'Road', 'Riverbank', 'Other'],
  dateOfObservation: Date
  
  // Location information
  location: {
    coordinates: {
      type: 'Point',
      coordinates: [lng, lat]
    },
    address: String,
    area: String
  }
  
  // Media attachments
  media: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: Date
  }]
  
  // Status and workflow
  status: Enum ['Pending', 'Verified', 'Action Taken', 'Closed', 'Rejected'],
  priority: Enum ['Low', 'Medium', 'High', 'Critical'],
  stage: Number (0-4)
  
  // Administrative fields
  assignedTo: ObjectId (ref: User),
  estimatedResolutionTime: Number (days),
  notes: [{
    content: String,
    addedBy: ObjectId (ref: User),
    addedAt: Date,
    isInternal: Boolean
  }]
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  verifiedAt: Date,
  actionTakenAt: Date,
  closedAt: Date
}
```

## API Endpoints

### Reports API (`/api/reports`)

#### Public Endpoints
- `GET /` - Health check

#### Protected Endpoints (Require Authentication)

**Citizen Endpoints:**
- `POST /` - Create new report
- `GET /my-reports` - Get user's reports
- `GET /:id` - Get specific report
- `POST /:id/notes` - Add note to report

**Admin/Enforcement Endpoints:**
- `GET /` - Get all reports (Admin only)
- `PUT /:id/status` - Update report status
- `PUT /:id/assign` - Assign report to enforcement officer (Admin only)
- `GET /stats/overview` - Get report statistics

## Features Implemented

### 1. Report Submission
- ✅ Comprehensive form validation (client and server-side)
- ✅ Real-time form validation with error messages
- ✅ File upload support (images/videos)
- ✅ Location coordinates validation
- ✅ Unique report ID generation
- ✅ Flash messages for successful submission

### 2. Report Management
- ✅ View submitted reports with pagination
- ✅ Filter reports by status
- ✅ Detailed report view with timeline
- ✅ Status tracking and updates
- ✅ Notes and comments system

### 3. User Experience
- ✅ Responsive design with dark mode support
- ✅ Loading states and error handling
- ✅ Smooth animations and transitions
- ✅ Intuitive navigation and feedback

### 4. Security & Validation
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ✅ MongoDB injection protection
- ✅ Error handling and logging

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── Report.js          # MongoDB schema for reports
│   │   └── User.js            # User model
│   ├── routes/
│   │   └── reports.js         # Report API endpoints
│   └── middleware/
│       ├── authMiddleware.js  # JWT authentication
│       └── roleMiddleware.js  # Role-based access control

client1/
├── src/
│   ├── components/
│   │   └── Citizen/
│   │       ├── ReportForm.jsx     # Report submission form
│   │       └── MyReports.jsx      # Report listing and details
│   └── services/
│       └── reportService.js       # API service layer
```

## Setup Instructions

### Backend Setup

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables:**
   Create `.env` file in backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bhunirakshak
   JWT_SECRET=your-super-secret-jwt-key
   PORT=8080
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start Server:**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Install Dependencies:**
   ```bash
   cd client1
   npm install
   ```

2. **Environment Variables:**
   Create `.env` file in client1 directory:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_MAPBOX_TOKEN=your-mapbox-token
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Testing

### API Testing
Run the test script to verify API endpoints:
```bash
node test-report-api.js
```

### Manual Testing
1. Start both backend and frontend servers
2. Register/login as a citizen user
3. Navigate to the report submission form
4. Fill out the form and submit
5. Check the "My Reports" section to view submitted reports

## Key Features

### 1. Form Validation
- Real-time validation with visual feedback
- Server-side validation with detailed error messages
- Phone number format validation (10 digits)
- Email format validation
- Required field validation
- Location coordinates validation

### 2. Flash Messages
- Success messages with report ID
- Error messages with specific details
- Auto-dismissing notifications
- Animated transitions

### 3. Report Tracking
- Status timeline visualization
- Progress indicators
- Detailed report information
- Notes and comments system

### 4. Responsive Design
- Mobile-friendly interface
- Dark mode support
- Accessible design patterns
- Smooth animations

## Database Indexes

The Report model includes optimized indexes for better performance:
- `location.coordinates`: 2dsphere index for geospatial queries
- `reporter`: Index for user-specific queries
- `status`: Index for status-based filtering
- `category`: Index for category-based filtering
- `createdAt`: Index for date-based sorting
- `reportId`: Unique index for report identification

## Error Handling

### Client-Side
- Form validation errors with field-specific messages
- Network error handling with retry options
- Loading states and user feedback
- Graceful degradation for offline scenarios

### Server-Side
- Comprehensive validation with detailed error messages
- MongoDB error handling (duplicate keys, validation errors)
- Authentication and authorization error handling
- Proper HTTP status codes and error responses

## Security Considerations

1. **Authentication**: JWT-based authentication with secure token handling
2. **Authorization**: Role-based access control for different user types
3. **Input Validation**: Comprehensive validation on both client and server
4. **Data Sanitization**: Proper sanitization of user inputs
5. **Error Handling**: Secure error messages without exposing sensitive information

## Future Enhancements

1. **File Upload**: Implement actual file upload to cloud storage
2. **Real-time Updates**: WebSocket integration for live status updates
3. **Email Notifications**: Automated email notifications for status changes
4. **Advanced Filtering**: More sophisticated filtering and search options
5. **Export Functionality**: PDF/Excel export of reports
6. **Mobile App**: React Native mobile application
7. **Analytics Dashboard**: Advanced analytics and reporting features

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check MONGODB_URI in environment variables
   - Verify network connectivity

2. **Authentication Errors:**
   - Check JWT_SECRET in environment variables
   - Verify token expiration
   - Ensure proper role assignments

3. **CORS Errors:**
   - Check FRONTEND_URL in backend environment
   - Verify CORS configuration in backend

4. **Form Submission Errors:**
   - Check browser console for validation errors
   - Verify all required fields are filled
   - Check network connectivity

## Support

For technical support or questions about the implementation, please refer to the project documentation or contact the development team.
