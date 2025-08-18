# Image Display in Citizen Portal Reports

## Overview
This document explains how images are displayed when viewing report details in the citizen portal.

## How It Works

### Backend Configuration
1. **Static File Serving**: The backend serves uploaded media files from the `/uploads` directory
2. **Media Upload Route**: Added a new route `/api/reports/:id/media` for adding media to reports
3. **File Storage**: Media files are stored in the `backend/uploads/` directory

### Frontend Implementation
1. **ReportDetailsModal**: A dedicated component for displaying report details with images
2. **Image Display**: Images are displayed with proper error handling and fallbacks
3. **File Type Detection**: Automatically detects image files vs other file types
4. **Responsive Layout**: Two-column layout with report details on left, media on right

## Features

### Image Display
- **Automatic Detection**: Recognizes image files by MIME type
- **Responsive Images**: Images scale properly on different screen sizes
- **Error Handling**: Shows fallback content if images fail to load
- **File Information**: Displays filename, size, and type

### Non-Image Files
- **File Icons**: Shows appropriate icons for different file types
- **Download Links**: Provides download functionality for non-image files
- **File Details**: Shows file size and MIME type

### Layout
- **Two-Column Design**: Report details on left, media files on right
- **Scrollable Content**: Handles long content with proper scrolling
- **Responsive Grid**: Adapts to different screen sizes

## Usage

### Viewing Report Details
1. Navigate to "My Reports" in the citizen portal
2. Click "View Details" on any report
3. Images will automatically display if they exist
4. Non-image files show as downloadable items

### Adding Media to Reports
1. Use the `/api/reports/:id/media` endpoint
2. Send media files in the request body
3. Files are stored in the uploads directory
4. URLs are automatically generated for access

## File Structure
```
backend/
├── uploads/           # Media files storage
├── src/
│   ├── index.js      # Static file serving configuration
│   └── routes/
│       └── reports.js # Media upload routes
client1/src/components/Citizen/
├── ReportDetailsModal.jsx  # Image display component
└── MyReports.jsx          # Report listing with modal
```

## Configuration

### Backend
- Static files served from `/uploads` endpoint
- Media upload route at `/api/reports/:id/media`
- File storage in `backend/uploads/` directory

### Frontend
- API base URL: `http://localhost:8080` (default)
- Image URLs constructed as: `${API_URL}/uploads/${filename}`
- Fallback handling for missing or corrupted images

## Troubleshooting

### Images Not Displaying
1. Check if files exist in `backend/uploads/` directory
2. Verify backend server is running
3. Check browser console for CORS errors
4. Ensure file permissions are correct

### File Upload Issues
1. Verify uploads directory exists and is writable
2. Check file size limits
3. Ensure proper MIME type validation
4. Verify user permissions for media uploads

## Future Enhancements
- Image compression and optimization
- Thumbnail generation
- Multiple image formats support
- Drag and drop file uploads
- Image gallery view
- File preview for various document types
