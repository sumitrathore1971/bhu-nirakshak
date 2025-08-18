# Image Display Troubleshooting Guide

## Issue: Images not showing in report details

### Root Cause Analysis
The images are not showing because:
1. No reports have been submitted with actual image files yet
2. The uploads directory is empty
3. The frontend needs to be properly configured to display images

### Step-by-Step Solution

#### 1. Start the Backend Server
```bash
cd backend
npm start
```

#### 2. Start the Frontend Server
```bash
cd client1
npm run dev
```

#### 3. Test the Complete Flow

**Step 1: Submit a Report with Images**
1. Navigate to the citizen portal
2. Log in with a citizen account
3. Go to "Submit Report"
4. Fill out all required fields
5. **Important**: Upload some actual image files (JPG, PNG, etc.)
6. Submit the report

**Step 2: View the Report with Images**
1. Go to "My Reports"
2. Click "View Details" on the report you just submitted
3. Images should appear in the "Media Files" section

#### 4. Debug Information

**Check Browser Console**
- Open browser developer tools (F12)
- Look for console logs that show:
  - Report data being loaded
  - Media array contents
  - Image URLs being constructed
  - Any error messages

**Expected Console Output:**
```
ReportDetailsModal - Report data: {report object}
ReportDetailsModal - Media array: [{media objects}]
getMediaUrl - mediaItem: {media object}
getMediaUrl - Constructed URL from filename: http://localhost:8080/uploads/filename.jpg
Media 0: {media, mediaUrl, isImageFile, mimeType}
Image loaded successfully: http://localhost:8080/uploads/filename.jpg
```

#### 5. Common Issues and Fixes

**Issue 1: No images in uploads directory**
- Solution: Submit a report with actual image files
- The uploads directory will be populated automatically

**Issue 2: Images not loading**
- Check if the backend server is running on port 8080
- Verify the image URLs in browser console
- Check if files exist in backend/uploads/ directory

**Issue 3: CORS errors**
- The backend is configured with CORS for localhost
- Make sure you're accessing from the correct frontend URL

**Issue 4: Environment variables**
- The frontend uses `import.meta.env.VITE_API_BASE` for API URL
- Default fallback is `http://localhost:8080`

#### 6. Manual Test

**Create a test image:**
```bash
# Create a test image file
echo "Test image content" > backend/uploads/test-image.jpg
```

**Test static file serving:**
- Open browser and go to: `http://localhost:8080/uploads/test-image.jpg`
- Should see the file content

#### 7. Verification Steps

1. **Backend Server**: Running on port 8080
2. **Static File Serving**: `/uploads/` endpoint working
3. **File Upload**: Multer configured and working
4. **Frontend**: Properly constructing image URLs
5. **Database**: Reports with media files stored correctly

#### 8. Expected Behavior

When everything is working correctly:
- Images uploaded during report submission are stored in `backend/uploads/`
- Image URLs are constructed as `http://localhost:8080/uploads/filename`
- Images display properly in the report details modal
- Non-image files show as downloadable items
- Error handling shows fallback content for missing images

### Quick Test

To quickly test if the system is working:

1. **Submit a test report with an image**
2. **Check the uploads directory**: `dir backend\uploads`
3. **View the report details** and check browser console
4. **Verify image URLs** are being constructed correctly

If you're still not seeing images, please check the browser console for any error messages and share them for further debugging.
