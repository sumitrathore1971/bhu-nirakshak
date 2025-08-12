import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CitizenPortal from '@/pages/CitizenPortal/CitizenPortal';

// Example router setup for the Citizen Portal with sidebar navigation
export default function ExampleRouter() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/citizen-dashboard" replace />} />
        
        {/* Citizen Portal Routes */}
        <Route path="/" element={<CitizenPortal />} />
        <Route path="/citizen-repor" element={<CitizenPortal />} />
        <Route path="/citizen-my-reports" element={<CitizenPortal />} />
        <Route path="/citizen-track" element={<CitizenPortal />} />
        <Route path="/citizen-help" element={<CitizenPortal />} />
        <Route path="/citizen-profile" element={<CitizenPortal />} />
        
        {/* Login route for logout redirect */}
        <Route path="/login" element={<div>Login Page</div>} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/citizen-dashboard" replace />} />
      </Routes>
    </Router>
  );
}

/*
  USAGE INSTRUCTIONS:
  
  1. Replace your main App.jsx with this router setup
  2. The sidebar will automatically handle navigation between routes
  3. Each route will render the CitizenPortal component with different active states
  4. The sidebar will highlight the active menu item based on the current route
  
  SIDEBAR FEATURES:
  - Fixed left sidebar on desktop (collapsible)
  - Slide-in from left on mobile with backdrop
  - Active route highlighting with blue background
  - JWT logout functionality
  - Responsive design with TailwindCSS
  
  ROUTES:
  - /citizen-dashboard → Dashboard view
  - /citizen-report → Report Encroachment form
  - /citizen-my-reports → My Reports view
  - /citizen-track → Track Case view
  - /citizen-help → Help & Guidelines
  - /citizen-profile → Profile management
  - /login → Login page (for logout redirect)
  
  COMPONENTS:
  - Sidebar.jsx → Main sidebar component
  - CitizenLayout.jsx → Layout wrapper with sidebar
  - Dashboard.jsx → Dashboard page
  - HelpGuidelines.jsx → Help page
  - Profile.jsx → Profile page
  - TrackCase.jsx → Track case page
  
  STYLING:
  - Uses TailwindCSS classes
  - Framer Motion animations
  - Lucide React icons
  - Responsive design patterns
  - Consistent with Admin/Enforcement UI patterns
*/
