# Troubleshooting Report Submission Issues

## Problem: "I am not able to submit report"

If you're having trouble submitting a report, follow these steps to identify and resolve the issue:

## 🔍 **Step 1: Check Authentication Status**

### **Issue**: You're not logged in
**Symptoms**: 
- Form shows "Authentication Required" message
- Submit button is disabled
- Redirected to login page

**Solution**:
1. Click "Go to Login" button
2. Enter your credentials
3. Make sure you're logged in as a **Citizen** user
4. Return to the report form

### **Issue**: Authentication token expired
**Symptoms**:
- Form loads but submission fails
- Error message: "Authentication failed. Please log in again."

**Solution**:
1. Log out and log back in
2. Clear browser cache and cookies
3. Try submitting again

## 🔍 **Step 2: Check Form Validation**

### **Issue**: Required fields not filled
**Symptoms**:
- Submit button remains disabled
- Red error messages under fields

**Required Fields**:
- ✅ Full Name
- ✅ Contact Number (10 digits)
- ✅ Report Title
- ✅ Description
- ✅ Category
- ✅ Date of Observation
- ✅ Location (Latitude & Longitude)

**Solution**:
1. Fill in all required fields marked with *
2. Ensure phone number is exactly 10 digits
3. Select a category from the dropdown
4. Enter valid coordinates (latitude: -90 to 90, longitude: -180 to 180)

## 🔍 **Step 3: Check Network & Backend**

### **Issue**: Backend server not running
**Symptoms**:
- Error message: "Failed to submit report"
- Network error in browser console

**Solution**:
1. Ensure backend server is running on port 8080
2. Check if MongoDB is running
3. Verify environment variables are set correctly

### **Issue**: CORS or API URL problems
**Symptoms**:
- Network errors in browser console
- "Failed to fetch" errors

**Solution**:
1. Check if `VITE_API_URL` is set correctly in `.env` file
2. Ensure backend CORS is configured for your frontend URL
3. Check if both frontend and backend are running

## 🔍 **Step 4: Browser Issues**

### **Issue**: Browser cache problems
**Symptoms**:
- Form behaves unexpectedly
- Old data persists

**Solution**:
1. Clear browser cache and cookies
2. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
3. Try in incognito/private mode

### **Issue**: JavaScript errors
**Symptoms**:
- Form doesn't load properly
- Console shows errors

**Solution**:
1. Open browser developer tools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

## 🔍 **Step 5: Environment Setup**

### **Backend Environment Variables**
Create `.env` file in `backend/` directory:
```env
MONGODB_URI=mongodb://localhost:27017/bhunirakshak
JWT_SECRET=your-super-secret-jwt-key
PORT=8080
FRONTEND_URL=http://localhost:5173
```

### **Frontend Environment Variables**
Create `.env` file in `client1/` directory:
```env
VITE_API_URL=http://localhost:8080/api
VITE_MAPBOX_TOKEN=your-mapbox-token
```

## 🔍 **Step 6: Database Issues**

### **Issue**: MongoDB not running
**Symptoms**:
- Backend fails to start
- Database connection errors

**Solution**:
1. Start MongoDB service
2. Check if MongoDB is running on port 27017
3. Verify database connection string

### **Issue**: Database permissions
**Symptoms**:
- Authentication errors
- Permission denied errors

**Solution**:
1. Check MongoDB user permissions
2. Ensure database exists and is accessible

## 🔍 **Step 7: Common Error Messages**

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Authentication required" | Not logged in | Log in as Citizen user |
| "Authentication failed" | Token expired | Log out and log back in |
| "Access denied" | Wrong user role | Use Citizen account |
| "Validation failed" | Invalid form data | Check all required fields |
| "Network error" | Backend not running | Start backend server |
| "Failed to fetch" | API URL incorrect | Check VITE_API_URL |

## 🔍 **Step 8: Testing Steps**

### **Quick Test**:
1. **Start Backend**: `cd backend && npm start`
2. **Start Frontend**: `cd client1 && npm run dev`
3. **Login**: Go to `/login` and create/login as Citizen
4. **Test Form**: Fill out all required fields
5. **Submit**: Click submit and check for success message

### **Debug Mode**:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try submitting a report
4. Check for any error messages
5. Look at Network tab for failed requests

## 🔍 **Step 9: Still Having Issues?**

If you're still unable to submit reports:

1. **Check Logs**: Look at backend console for error messages
2. **Verify Setup**: Ensure all dependencies are installed
3. **Test API**: Use the test script: `node test-report-api.js`
4. **Check Database**: Verify MongoDB connection and data
5. **Browser Console**: Check for JavaScript errors

## 🔍 **Step 10: Emergency Workaround**

If the form is completely broken:

1. **Use API Directly**: Submit report via API endpoint
2. **Check Backend**: Verify backend is working independently
3. **Alternative Frontend**: Try a different browser or device
4. **Contact Support**: Provide error logs and steps to reproduce

## 📞 **Need Help?**

If you're still experiencing issues:

1. **Collect Information**:
   - Error messages from browser console
   - Backend server logs
   - Steps to reproduce the issue
   - Your environment (OS, browser, etc.)

2. **Contact Support**:
   - Share the collected information
   - Describe what you were trying to do
   - Mention any error messages you saw

---

**Remember**: Most issues are related to authentication or form validation. Make sure you're logged in as a Citizen user and all required fields are properly filled out.
