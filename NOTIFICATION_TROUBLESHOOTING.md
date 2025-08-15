# Notification System Troubleshooting Guide

## Issue Description
The socket is connected and reports are being sent when citizens upload reports, but notifications are not appearing in the admin dashboard notification bell.

## Root Causes Identified

### 1. Multiple Socket Connections Conflict
**Problem**: Both `NotificationPanel` and `Dashboard` components were setting up their own socket connections, causing conflicts.

**Solution**: 
- Modified `socketService.js` to track connection count and prevent premature disconnection
- Removed `cleanup()` calls from `NotificationPanel` useEffect cleanup
- Added proper listener management to prevent duplicates

### 2. Socket Listener Duplication
**Problem**: Multiple listeners were being attached for the same event, causing conflicts.

**Solution**:
- Added duplicate prevention in `onNewReport` method
- Improved listener cleanup in `offNewReport` method
- Added connection tracking to prevent conflicts

## Fixes Applied

### 1. Updated SocketService (`client1/src/services/socketService.js`)
```javascript
// Added connection tracking
this.connectionCount = 0;

// Modified connect() to track multiple connections
connect() {
  if (this.socket && this.isConnected) {
    this.connectionCount++;
    return;
  }
  // ... rest of connection logic
  this.connectionCount++;
}

// Modified disconnect() to only disconnect when no components are using it
disconnect() {
  this.connectionCount--;
  if (this.connectionCount <= 0) {
    // Actually disconnect
  }
}

// Added duplicate prevention in onNewReport
onNewReport(callback) {
  // Remove any existing listeners for this callback
  this.socket.off(eventName, callback);
  // Add the new listener
  this.socket.on(eventName, callback);
  // Check for duplicates in listeners map
}
```

### 2. Updated NotificationPanel (`client1/src/components/Admin/NotificationPanel.jsx`)
```javascript
// Removed cleanup() calls that were interfering with other components
useEffect(() => {
  // ... socket setup
  return () => {
    socketService.offNewReport(handleNewReport);
    // Removed: socketService.cleanup();
  };
}, [user]);

// Added detailed debugging
const handleNewReport = (data) => {
  console.log("🔔 Received new report notification:", data);
  console.log("🔔 Current notifications count:", notifications.length);
  // ... rest of handler with detailed logging
};
```

## Testing Steps

### 1. Verify Socket Connection
```bash
node debug-notifications.js
```
Expected output:
```
✅ Connected to Socket.io server
👨‍💼 Joined admin notification room
📡 Listening for notifications...
```

### 2. Test Manual Notification
```bash
node test-manual-notification.js
```
Expected output:
```
✅ Connected to Socket.io server
👨‍💼 Joined admin notification room
📢 Emitting test notification...
📢 Received new report notification:
✅ Manual notification test successful!
```

### 3. Test Report Submission
```bash
node test-report-submission.js
```
This will test the full flow from report submission to notification emission.

## Debugging Steps

### 1. Check Browser Console
Look for these log messages:
- `🔌 Connected to Socket.io server`
- `👨‍💼 Joined admin notification room`
- `🔔 Setting up socket connection for user: Admin`
- `🔔 Socket connection status: { isConnected: true, socketId: "...", connectionCount: 1 }`

### 2. Check Backend Console
Look for these log messages:
- `Client connected: [socket-id]`
- `Admin joined notification room: [socket-id]`
- `newReport` event emission in reports.js

### 3. Verify Environment Variables
Ensure `VITE_API_URL` is set correctly in frontend:
```env
VITE_API_URL=http://localhost:8080
```

## Common Issues and Solutions

### Issue 1: Notifications not appearing
**Check**:
1. Browser console for socket connection errors
2. Backend console for socket join messages
3. Network tab for WebSocket connection

### Issue 2: Multiple notifications for same report
**Cause**: Duplicate listeners
**Solution**: The fixes above should prevent this

### Issue 3: Notifications disappear immediately
**Cause**: Auto-cleanup timer
**Solution**: Notifications auto-remove after 30 seconds (this is by design)

### Issue 4: Sound not playing
**Check**:
1. `notification-sound.mp3` exists in `client1/public/`
2. Browser autoplay policies
3. Sound is enabled in notification panel

## Verification Checklist

- [ ] Backend server is running on port 8080
- [ ] Frontend is running on port 5173
- [ ] Socket connection established (check browser console)
- [ ] Admin user is logged in
- [ ] Admin room joined successfully
- [ ] Report submission endpoint working
- [ ] Socket event emission working
- [ ] Frontend notification handler receiving events
- [ ] Notification UI updating correctly

## Additional Debugging

If issues persist, add these debug statements:

### In Backend (`backend/src/routes/reports.js`)
```javascript
// Before emitting notification
console.log("📢 Emitting newReport to admin room");
console.log("📢 Report data:", JSON.stringify(populatedReport, null, 2));

req.io.to("admin-room").emit("newReport", {
  report: populatedReport,
  timestamp: new Date().toISOString(),
});

console.log("📢 Notification emitted successfully");
```

### In Frontend (`client1/src/components/Admin/NotificationPanel.jsx`)
```javascript
// Add to handleNewReport
console.log("🔔 Notification state before update:", {
  notifications: notifications.length,
  unreadCount
});
```

## Performance Considerations

- Notifications auto-remove after 30 seconds to prevent memory leaks
- Socket connection is shared between components
- Connection count prevents premature disconnection
- Duplicate listeners are prevented

## Future Improvements

1. Add notification persistence in database
2. Add notification preferences per user
3. Add email notifications as backup
4. Add push notifications for mobile
5. Add notification history page
