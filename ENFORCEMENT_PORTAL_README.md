# Enforcement Portal - Task Assignment System

## Overview
The Enforcement Portal provides a comprehensive task management system for enforcement officers to handle citizen reports and illegal construction cases assigned by administrators.

## Key Features

### 1. Task Assignment System
- **Real-time Assignment**: Enforcement officers receive new case assignments instantly via WebSocket notifications
- **Visual Notifications**: Blue notification banner appears when new cases are assigned
- **Quick Actions**: Direct access to view case details and start working on cases

### 2. Case Management
- **Status Tracking**: 
  - Pending → In Progress → Verified → Action Taken → Closed
  - New "In Progress" status for active enforcement work
- **Priority Levels**: Critical, High, Medium, Low with color-coded indicators
- **Risk Scoring**: Visual risk assessment with color-coded indicators

### 3. Photo & Media Display
- **Image Rendering**: Properly displays uploaded photos from citizen reports
- **Media Support**: Handles both images and documents with appropriate icons
- **Error Handling**: Graceful fallback for failed image loads

### 4. Enhanced Filtering & Search
- **Multi-criteria Search**: Search by Case ID, location, violation type
- **Status Filtering**: Filter by case status (Pending, In Progress, Verified, etc.)
- **Priority Filtering**: Filter by case priority level
- **Sorting Options**: Sort by date, risk score, or priority
- **Closed Cases Toggle**: Option to show/hide closed cases

### 5. Workload Dashboard
- **Real-time Statistics**: Live counts of cases by status
- **Visual Indicators**: Color-coded status cards with icons
- **Quick Overview**: At-a-glance workload assessment

### 6. Case Details & Actions
- **Comprehensive View**: Overview, Photos, AI Analysis, Action History tabs
- **Quick Actions**: Start Working, Mark as Verified, Mark Action Taken, Close Case
- **Note System**: Add internal notes and comments to cases
- **Urgent Marking**: Mark cases as urgent for priority handling

### 7. Export & Reporting
- **CSV Export**: Export case data for external analysis
- **Data Management**: Clear closed cases to maintain active workload
- **Refresh Functionality**: Manual refresh of case data

## Technical Implementation

### Socket Integration
- **Real-time Updates**: WebSocket connection for instant case assignments
- **Room Management**: Dedicated enforcement room for targeted notifications
- **Event Handling**: `assignToEnforcement` event for case distribution

### Data Persistence
- **Local Storage**: Cases stored locally for offline access
- **State Management**: React state with proper data flow
- **Data Synchronization**: Real-time updates with local persistence

### Media Handling
- **URL Construction**: Proper media URL generation for image display
- **MIME Type Detection**: Automatic file type recognition
- **Error Handling**: Graceful fallbacks for media loading issues

## User Workflow

### 1. Case Assignment
1. Admin assigns case from Citizen Reports
2. Enforcement officer receives real-time notification
3. Case appears in enforcement portal with "New Assignment" indicator

### 2. Case Processing
1. Officer reviews case details and photos
2. Marks case as "In Progress" when starting work
3. Updates status through workflow progression
4. Adds notes and marks urgent if needed

### 3. Case Resolution
1. Officer verifies case details
2. Takes necessary enforcement action
3. Marks case as "Action Taken"
4. Closes case when resolved

## File Structure

```
client1/src/components/Enforcement/
├── CaseManagement.jsx          # Main enforcement portal component
├── Dashboard.jsx               # Enforcement dashboard
├── Navbar.jsx                  # Navigation component
└── Sidebar.jsx                 # Sidebar navigation
```

## Dependencies

- **Frontend**: React, Framer Motion, Lucide React icons
- **State Management**: React hooks (useState, useEffect)
- **Real-time**: Socket.io client integration
- **Styling**: Tailwind CSS with dark mode support

## Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:8080  # Backend API URL
```

### Socket Events
- `assignToEnforcement`: Case assignment from admin
- `join-enforcement`: Join enforcement notification room

## Usage Examples

### Adding a Note to a Case
```javascript
addNoteToCase(caseId, "Site inspection completed - violation confirmed");
```

### Marking Case as Urgent
```javascript
markCaseAsUrgent(caseId);
```

### Starting Work on a Case
```javascript
startWorkingOnCase(caseId);
```

## Troubleshooting

### Common Issues

1. **Images Not Displaying**
   - Check media URL construction
   - Verify backend uploads directory
   - Check CORS configuration

2. **Socket Connection Issues**
   - Verify backend server is running
   - Check WebSocket endpoint configuration
   - Review network connectivity

3. **Case Assignment Not Working**
   - Verify admin has assigned case
   - Check socket room membership
   - Review event emission/reception

### Debug Information
- Console logging for all major operations
- Socket connection status monitoring
- Case data flow tracking

## Future Enhancements

- **Mobile App**: Native mobile application for field officers
- **GPS Integration**: Location-based case assignment
- **Photo Upload**: Direct photo upload from enforcement officers
- **Workflow Automation**: Automated status transitions
- **Reporting Dashboard**: Advanced analytics and reporting
- **Integration**: Third-party enforcement system integration

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
