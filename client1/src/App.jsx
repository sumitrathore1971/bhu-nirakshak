import { Routes, Route } from "react-router";
import LandingPage from "./pages/LandingPage/LandingPage";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboardPage";
import CitizenPortal from "./pages/CitizenPortal/CitizenPortal";
import DepartmentPanelPage from "./pages/DepartmentPanel/DepartmentPanelPage";
import EnforcementPage from "./pages/EnforcementTracker/EnforcementPage";
import SlumDevelopmentPage from "./pages/SlumDevelopment/SlumDevelopmentPage";
import Navbar from "./pages/LandingPage/Navbar";
import NotFound from "./pages/NotFound";
import Footer from "./pages/Footer";  
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import NavbarDemo from "./pages/NavbarDemo";

function App() {
  return (
    <>
     {/* <Navbar/> */}
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pt-20"><div className="max-w-4xl mx-auto px-4 py-8"><h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">About Bhu-Nirakshak</h1><p className="text-lg text-gray-600 dark:text-gray-300">A comprehensive platform for land monitoring and enforcement.</p></div></div>} />
          <Route path="/contact" element={<div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pt-20"><div className="max-w-4xl mx-auto px-4 py-8"><h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h1><p className="text-lg text-gray-600 dark:text-gray-300">Get in touch with our team for support and inquiries.</p></div></div>} />
          <Route path="/help" element={<div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pt-20"><div className="max-w-4xl mx-auto px-4 py-8"><h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Help & Support</h1><p className="text-lg text-gray-600 dark:text-gray-300">Find answers to common questions and get help using the platform.</p></div></div>} />
          <Route path="/demo" element={<NavbarDemo />} />
          <Route path="api/auth/login" element={<LoginPage />} />
          <Route path="api/auth/signup" element={<SignupPage />} />

          {/* Required role-based dashboard paths */}
          <Route path="/citizen-dashboard" element={
            <ProtectedRoute allow={["Citizen"]}>
              <CitizenPortal />
            </ProtectedRoute>
          } />
          <Route path="/enforce-dashboard" element={
            <ProtectedRoute allow={["Enforcement"]}>
              <EnforcementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allow={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Protected legacy routes for compatibility */}
          <Route path="/admin" element={<ProtectedRoute allow={["Admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/citizen" element={<ProtectedRoute allow={["Citizen"]}><CitizenPortal /></ProtectedRoute>} />
          <Route path="/citizen/dashboard" element={<ProtectedRoute allow={["Citizen"]}><CitizenPortal /></ProtectedRoute>} />
          <Route path="/citizen/report" element={<ProtectedRoute allow={["Citizen"]}><CitizenPortal /></ProtectedRoute>} />
          <Route path="/citizen/my-reports" element={<ProtectedRoute allow={["Citizen"]}><CitizenPortal /></ProtectedRoute>} />
          <Route path="/citizen/track" element={<ProtectedRoute allow={["Citizen"]}><CitizenPortal /></ProtectedRoute>} />
          <Route path="/citizen/help" element={<ProtectedRoute allow={["Citizen"]}><CitizenPortal /></ProtectedRoute>} />
          <Route path="/citizen/profile" element={<ProtectedRoute allow={["Citizen"]}><CitizenPortal /></ProtectedRoute>} />
          <Route path="/department" element={<DepartmentPanelPage />} />
          <Route path="/enforcement" element={<ProtectedRoute allow={["Enforcement"]}><EnforcementPage /></ProtectedRoute>} />
          <Route path="/slumdevelop" element={<SlumDevelopmentPage />} />
          <Route path="*" element={<NotFound/>} />
        </Routes>
      </div>
      <Footer/>
    </>
  );
}

export default App;
