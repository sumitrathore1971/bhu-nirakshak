# Bhu-Nirakshak Route Setup Guide

## Overview
This document outlines the complete routing setup for both the backend API and frontend client to ensure smooth data flow and user experience.

## Backend Routes (Port: 8080)

### Base URL
```
http://localhost:8080/api
```

### Authentication Routes (`/api/auth`)
- `POST /signup` - User registration
- `POST /login` - User login
- `GET /me` - Get current user info (protected)

### Reports Routes (`/api/reports`)
- `GET /` - Get all reports (Admin only)
- `GET /my-reports` - Get user's own reports (Citizen only)
- `POST /` - Create new report (Citizen only)
- `PUT /:id/status` - Update report status (Enforcement only)

### User Management Routes (`/api/users`)
- `GET /` - Get all users (Admin only)
- `GET /:id` - Get user by ID (Admin only)
- `PUT /:id/role` - Update user role (Admin only)
- `DELETE /:id` - Delete user (Admin only)

## Frontend Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/signup` - Registration page

### Protected Routes
- `/citizen-dashboard` - Citizen dashboard (Citizen role required)
- `/enforce-dashboard` - Enforcement dashboard (Enforcement role required)
- `/admin-dashboard` - Admin dashboard (Admin role required)

### Legacy Routes (for compatibility)
- `/citizen/*` - Redirects to citizen dashboard
- `/enforcement` - Redirects to enforcement dashboard
- `/admin` - Redirects to admin dashboard

## Environment Configuration

### Backend (.env)
```env
PORT=8080
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/bhunirakshak
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Frontend (env.example)
```env
VITE_API_BASE=http://localhost:8080/api
VITE_APP_NAME=Bhu-Nirakshak
VITE_APP_VERSION=1.0.0
```

## Authentication Flow

1. **Login/Signup**: User provides credentials and role
2. **Token Generation**: Backend generates JWT token
3. **Role-based Redirect**: Frontend redirects to appropriate dashboard
4. **Protected Access**: All dashboard routes require valid JWT token
5. **Role Validation**: Routes check user role for access control

## CORS Configuration

Backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev port)
- Configurable via `FRONTEND_URL` environment variable

## Error Handling

- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: User role doesn't have required permissions
- **404 Not Found**: Route doesn't exist
- **500 Internal Server Error**: Server-side errors

## Development Setup

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd client1
   npm install
   npm run dev
   ```

3. **Verify Connection**:
   - Backend: http://localhost:8080
   - Frontend: http://localhost:5173
   - API Health: http://localhost:8080/

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- CORS protection
- Input validation
- Protected route middleware

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 8080 and 5173 are available
2. **CORS Errors**: Check frontend URL in backend CORS configuration
3. **Authentication Failures**: Verify JWT_SECRET is set correctly
4. **Database Connection**: Ensure MongoDB is running on port 27017

### Debug Steps

1. Check browser console for frontend errors
2. Check backend terminal for server errors
3. Verify environment variables are loaded
4. Test API endpoints with Postman/curl
5. Check network tab for failed requests
