# Enforcement Portal - Bhu-Nirakshak

A comprehensive enforcement portal for monitoring and managing illegal construction cases in the Bhu-Nirakshak web application.

## 🏗️ Architecture

The Enforcement Portal is built with a modular component architecture:

```
EnforcementPortal/
├── EnforcementPage.jsx          # Main portal container
├── Sidebar.jsx                  # Navigation sidebar
├── Navbar.jsx                   # Top navigation bar
├── Dashboard.jsx                # Main dashboard with map
├── CaseManagement.jsx           # Case management interface
├── DroneOperations.jsx          # Drone surveillance management
├── Analytics.jsx                # Analytics and reporting
└── Settings.jsx                 # User preferences and configuration
```

## 🚀 Features

### 1. Dashboard
- **Interactive GIS Map** using Leaflet.js
- Real-time case markers with color-coded status
- AI-predicted risk zones visualization
- Layer toggles (Satellite, Cadastral, Drone)
- Case summary cards (Total, Pending, Verified, Action Taken, Closed)
- Recent cases list with quick access

### 2. Case Management
- **Comprehensive case table** with filtering and search
- Case details modal with multiple tabs:
  - Overview: Basic case information
  - Photos/Videos: Case evidence
  - AI Analysis: Automated violation detection results
  - Action History: Complete audit trail
- Bulk actions and export functionality
- Status management (Pending → Verified → Action Taken → Closed)

### 3. Drone Operations
- **Scheduled drone tasks** with priority and risk levels
- Real-time drone feed simulation
- AI-detected violations from drone imagery
- Task management (Schedule, Start, Reschedule, Cancel)
- Drone status monitoring (Location, Altitude, Battery, Signal)

### 4. Analytics & Reports
- **Performance metrics** dashboard
- Monthly case trends with interactive charts
- Violation type distribution analysis
- High-risk zone identification
- Enforcement action statistics
- Export options (PDF, Excel, CSV)

### 5. Settings & Configuration
- **User profile** management
- Notification preferences (Email, SMS, Push)
- Map configuration (Zoom levels, layers, auto-refresh)
- Security settings (2FA, session management)
- Data retention and export preferences

## 🛠️ Technical Stack

- **Frontend**: React 19 + JSX
- **Styling**: TailwindCSS 4.1
- **Maps**: Leaflet.js + React-Leaflet
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)
- **Responsive Design**: Mobile-first approach

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Trust, Authority
- **Secondary**: Orange (#F59E0B) - Action, Warning
- **Success**: Green (#10B981) - Completed, Verified
- **Warning**: Orange (#F59E0B) - Pending, Attention
- **Error**: Red (#EF4444) - Violations, Critical
- **Neutral**: Gray (#6B7280) - Text, Borders

### Typography
- **Headings**: Inter font family, bold weights
- **Body**: System font stack, regular weights
- **Hierarchy**: Clear visual hierarchy with consistent spacing

### Components
- **Cards**: Rounded corners, subtle shadows, consistent padding
- **Buttons**: Hover effects, loading states, icon integration
- **Forms**: Focus states, validation feedback, accessible labels
- **Modals**: Smooth animations, backdrop blur, responsive sizing

## 📱 Responsive Design

The portal is fully responsive with:
- **Mobile-first** approach
- **Collapsible sidebar** on mobile devices
- **Adaptive layouts** for different screen sizes
- **Touch-friendly** interactions
- **Optimized navigation** for mobile users

## 🔧 Integration Points

### PhotoDCR Integration
- AI comparison between on-site images and approved plans
- Automated violation detection
- Confidence scoring for violations

### Citizen Complaint System
- Links to related citizen reports
- Cross-reference with enforcement cases
- Public-private data integration

### Field Officer Mobile App
- GPS-tagged field images
- Real-time case updates
- Offline capability for field work

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- React development environment

### Installation
```bash
# Navigate to the client directory
cd client1

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage
1. Navigate to the Enforcement Portal
2. Use the sidebar to switch between different sections
3. Interact with the map to view case locations
4. Manage cases through the case management interface
5. Monitor drone operations in real-time
6. Generate reports and analytics
7. Configure personal settings

## 🔒 Security Features

- **Role-based access control** (Enforcement Officer, IMC Staff, etc.)
- **Session management** with timeout controls
- **Two-factor authentication** support
- **Audit logging** for all actions
- **Data encryption** for sensitive information

## 📊 Data Management

- **Real-time updates** for live data
- **Offline caching** for field operations
- **Data export** in multiple formats
- **Backup and recovery** procedures
- **Compliance** with data protection regulations

## 🚧 Future Enhancements

- **Real-time collaboration** between officers
- **Advanced AI analytics** for predictive policing
- **Mobile app** for field officers
- **Integration** with municipal databases
- **Blockchain** for case integrity
- **IoT sensors** for automated monitoring

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add proper TypeScript types for new features
3. Include comprehensive error handling
4. Write unit tests for new components
5. Update documentation for new features

## 📄 License

This project is part of the Bhu-Nirakshak initiative and follows the project's licensing terms.

## 🆘 Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
