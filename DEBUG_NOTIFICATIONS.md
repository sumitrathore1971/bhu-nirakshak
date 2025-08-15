# Debugging Notification System - Step by Step

## Current Status
- ✅ Backend server is running on port 8080
- ✅ Socket.io connection is working
- ✅ Admin room joining is working
- ❓ Frontend notification panel needs testing

## Step-by-Step Debugging

### 1. Check Frontend Console
Open your browser and go to the admin dashboard. Open Developer Tools (F12) and check the console for these messages:

**Expected messages:**
```
🔌 Connected to Socket.io server
👨‍💼 Joined admin notification room
🔔 Setting up socket connection for user: Admin
🔔 Socket connection status: { isConnected: true, socketId: "...", connectionCount: 1 }
```

**If you don't see these messages:**
- Check if the frontend is running on port 5173
- Check if there are any JavaScript errors
- Verify the user is logged in as Admin

### 2. Check Backend Console
In your backend terminal, you should see:
```
Client connected: [socket-id]
Admin joined notification room: [socket-id]
📢 Admin room members: 1
```

### 3. Test Report Submission
1. Open a new browser tab/window
2. Log in as a Citizen user
3. Submit a new report
4. Check the backend console for:
```
📢 Emitting newReport notification to admin room
📢 Report data: { reportId: "...", title: "...", reporter: "...", category: "..." }
📢 Notifications emitted successfully
```

### 4. Check Frontend for Notifications
After submitting a report, check the admin dashboard for:
- Red badge on notification bell
- Notification popup when clicking the bell
- Console messages:
```
🔔 Received new report notification: [data]
🔔 Updated notifications array: 1 notifications
🔔 Updated unread count: 1
```

## Common Issues and Solutions

### Issue 1: No Socket Connection
**Symptoms:** No "🔌 Connected to Socket.io server" message
**Solutions:**
1. Check if backend is running: `curl http://localhost:8080`
2. Check if frontend is running: `http://localhost:5173`
3. Check browser console for CORS errors
4. Verify VITE_API_URL is set correctly

### Issue 2: Socket Connected but No Notifications
**Symptoms:** Socket connects but no notifications appear
**Solutions:**
1. Check if user role is "Admin"
2. Check if admin room is joined
3. Check backend console for notification emission
4. Check frontend console for notification reception

### Issue 3: Multiple Notifications
**Symptoms:** Same notification appears multiple times
**Solutions:**
1. Check for duplicate socket connections
2. Check for duplicate event listeners
3. Verify socket service cleanup

### Issue 4: Notifications Disappear Immediately
**Symptoms:** Notifications appear but disappear quickly
**Solutions:**
1. This is by design - notifications auto-remove after 30 seconds
2. Check if notifications are being marked as read automatically

## Quick Test Commands

### Test Socket Connection
```bash
node test-notification-quick.js
```

### Test Backend Health
```bash
curl http://localhost:8080
```

### Check Frontend
Open: `http://localhost:5173`

## Environment Variables Check

Make sure these are set correctly:

**Frontend (.env file in client1/):**
```env
VITE_API_URL=http://localhost:8080
```

**Backend (.env file in backend/):**
```env
FRONTEND_URL=http://localhost:5173
```

## Manual Testing Steps

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd client1
   npm run dev
   ```

3. **Test Admin Login:**
   - Go to `http://localhost:5173`
   - Log in as Admin user
   - Check browser console for socket messages

4. **Test Citizen Report:**
   - Open new tab
   - Log in as Citizen user
   - Submit a report
   - Check backend console for notification emission

5. **Check Admin Dashboard:**
   - Go back to admin dashboard
   - Look for notification bell with red badge
   - Click bell to see notifications

## Debugging Commands

### Check if ports are in use:
```bash
netstat -ano | findstr :8080
netstat -ano | findstr :5173
```

### Check if processes are running:
```bash
tasklist | findstr node
```

### Test API directly:
```bash
curl -X POST http://localhost:8080/api/reports \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Next Steps

If notifications still don't work after following these steps:

1. Check the browser's Network tab for WebSocket connections
2. Check for any JavaScript errors in the console
3. Verify that the user has the correct role (Admin)
4. Check if the notification sound file exists: `client1/public/notification-sound.mp3`
5. Try refreshing the page and logging in again

## Contact Support

If the issue persists, please provide:
1. Browser console logs
2. Backend console logs
3. Network tab screenshots
4. Steps to reproduce the issue
