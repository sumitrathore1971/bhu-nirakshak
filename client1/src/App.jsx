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

function App() {
  return (
    <>
     {/* <Navbar/> */}
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
