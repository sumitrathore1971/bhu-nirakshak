# Real-Time Notification System

This document describes the implementation of real-time notifications for the Bhu-Nirakshak MERN stack application using Socket.io.

## Overview

The real-time notification system allows admin and enforcement users to receive instant notifications when citizens submit new reports, without requiring page refreshes.

## Features

- ✅ **Real-time notifications** - Instant delivery when reports are submitted
- ✅ **Role-based notifications** - Admins and enforcement officers receive notifications
- ✅ **Rich notification content** - Shows reporter name, report details, location, and timestamp
- ✅ **Visual indicators** - Red badge counter for unread notifications
- ✅ **Sound notifications** - Optional audio alerts for new reports
- ✅ **Notification management** - Mark as read, clear all, individual removal
- ✅ **Auto-cleanup** - Notifications auto-remove after 30 seconds
- ✅ **Connection resilience** - Automatic reconnection on connection loss

## Architecture

### Backend (Socket.io Server)

1. **Server Setup** (`backend/src/index.js`)

   - Creates HTTP server with Socket.io
   - Sets up CORS for frontend connections
   - Makes `io` object available to routes via middleware

2. **Room Management**

   - `admin-room`: For admin users
   - `enforcement-room`: For enforcement officers

3. **Event Emission** (`backend/src/routes/reports.js`)
   - Emits `newReport` event after successful report creation
   - Populates report data with user details
   - Sends to both admin and enforcement rooms

### Frontend (Socket.io Client)

1. **Socket Service** (`client1/src/services/socketService.js`)

   - Manages Socket.io connection
   - Handles reconnection logic
   - Provides clean API for event listeners

2. **Notification Panel** (`client1/src/components/Admin/NotificationPanel.jsx`)

   - Displays real-time notifications
   - Manages notification state
   - Provides user interaction controls

3. **Integration** (`client1/src/components/Admin/Navbar.jsx`, `client1/src/components/Enforcement/Navbar.jsx`)
   - Embeds notification panel in navigation
   - Shows unread count badge

## Installation & Setup

### 1. Backend Dependencies

```bash
cd backend
npm install socket.io
```

### 2. Frontend Dependencies

```bash
cd client1
npm install socket.io-client
```

### 3. Environment Variables

Ensure your backend has the correct frontend URL in environment variables:

```env
FRONTEND_URL=http://localhost:5173
```

### 4. Notification Sound (Optional)

Place an MP3 file named `notification-sound.mp3` in `client1/public/` for audio notifications.

## Usage

### For Admins

1. Log in as an admin user
2. The notification bell will appear in the top navigation
3. When a citizen submits a report, you'll see:
   - Red badge with unread count
   - Instant notification popup
   - Optional sound alert
   - Report details including reporter name, location, and description

### For Enforcement Officers

1. Log in as an enforcement officer
2. Same notification experience as admins
3. Receive notifications for all new reports

### For Citizens

No changes to the existing report submission process. Notifications are automatically sent when reports are successfully submitted.

## API Events

### Backend Events (Server → Client)

| Event       | Data Structure                                           | Description                            |
| ----------- | -------------------------------------------------------- | -------------------------------------- |
| `newReport` | `{ type: 'newReport', report: {...}, timestamp: '...' }` | Emitted when a new report is submitted |

### Frontend Events (Client → Server)

| Event              | Description                        |
| ------------------ | ---------------------------------- |
| `join-admin`       | Join admin notification room       |
| `join-enforcement` | Join enforcement notification room |

## Data Structure

### Notification Object

```javascript
{
  id: Date.now(),
  type: 'newReport',
  title: 'New Report Submitted',
  message: 'Report "Title" submitted by John Doe',
  report: {
    _id: '...',
    reportId: '...',
    title: '...',
    description: '...',
    category: '...',
    reporter: {
      userId: { _id: '...', name: '...', email: '...' },
      fullName: '...',
      phone: '...',
      email: '...'
    },
    location: {
      coordinates: { type: 'Point', coordinates: [lng, lat] },
      address: '...',
      area: '...'
    },
    createdAt: '...',
    // ... other report fields
  },
  timestamp: '2024-01-18T10:30:00.000Z',
  isRead: false,
  priority: 'high'
}
```

## Configuration

### Socket.io Server Configuration

```javascript
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});
```

### Socket.io Client Configuration

```javascript
const socket = io(backendUrl, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});
```

## Troubleshooting

### Common Issues

1. **Notifications not appearing**

   - Check browser console for Socket.io connection errors
   - Verify backend is running and accessible
   - Ensure user is logged in with correct role

2. **Connection errors**

   - Check CORS configuration
   - Verify frontend URL in backend environment
   - Check network connectivity

3. **Sound not playing**
   - Ensure notification sound file exists in `public/` directory
   - Check browser autoplay policies
   - Verify audio element is properly configured

### Debug Mode

Enable debug logging by checking browser console for:

- `🔌 Connected to Socket.io server`
- `👨‍💼 Joined admin notification room`
- `📢 Received new report notification`

## Security Considerations

1. **Authentication**: Only authenticated users can join notification rooms
2. **Role-based access**: Different rooms for different user roles
3. **Data validation**: Report data is validated before emission
4. **CORS protection**: Proper CORS configuration prevents unauthorized access

## Performance Considerations

1. **Connection pooling**: Socket.io handles multiple concurrent connections
2. **Event filtering**: Only relevant users receive notifications
3. **Auto-cleanup**: Notifications are automatically removed to prevent memory leaks
4. **Reconnection logic**: Automatic reconnection on connection loss

## Future Enhancements

- [ ] Push notifications for mobile devices
- [ ] Email notifications as backup
- [ ] Notification preferences per user
- [ ] Notification history persistence
- [ ] Advanced filtering and search
- [ ] Notification templates for different report types

## Testing

### Manual Testing

1. Start backend server: `npm run dev`
2. Start frontend: `npm run dev`
3. Log in as admin/enforcement user
4. Open another browser/tab and log in as citizen
5. Submit a report as citizen
6. Verify notification appears in admin/enforcement panel

### Automated Testing

The system can be tested by:

- Unit testing socket service functions
- Integration testing with mock Socket.io server
- E2E testing with real browser automation

## Support

For issues or questions about the real-time notification system, please refer to:

- Socket.io documentation: https://socket.io/docs/
- React Socket.io integration: https://socket.io/docs/v4/client-api/
- Browser console for connection status and errors
