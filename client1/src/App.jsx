import { Routes, Route, useLocation } from "react-router-dom";
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
import About from "./pages/About";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import RevenueDepartmentPage from "./pages/RevenueDepartment/RevenueDepartmentPage";

function App() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  return (
    <>
      {/* <Navbar/> */}
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<Help />} />
          <Route path="/demo" element={<NavbarDemo />} />
          <Route path="api/auth/login" element={<LoginPage />} />
          <Route path="api/auth/signup" element={<SignupPage />} />

          {/* Required role-based dashboard paths */}
          <Route
            path="/citizen-dashboard"
            element={
              <ProtectedRoute allow={["Citizen"]}>
                <CitizenPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enforce-dashboard"
            element={
              <ProtectedRoute allow={["Enforcement"]}>
                <EnforcementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allow={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected legacy routes for compatibility */}
          <Route
            path="/revenue-dashboard"
            element={
              <ProtectedRoute allow={["Revenue"]}>
                <RevenueDepartmentPage />
              </ProtectedRoute>
            }
          />

          {/* Protected legacy routes for compatibility */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allow={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen"
            element={
              <ProtectedRoute allow={["Citizen"]}>
                <CitizenPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/dashboard"
            element={
              <ProtectedRoute allow={["Citizen"]}>
                <CitizenPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/report"
            element={
              <ProtectedRoute allow={["Citizen"]}>
                <CitizenPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/my-reports"
            element={
              <ProtectedRoute allow={["Citizen"]}>
                <CitizenPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/track"
            element={
              <ProtectedRoute allow={["Citizen"]}>
                <CitizenPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/help"
            element={
              <ProtectedRoute allow={["Citizen"]}>
                <CitizenPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/profile"
            element={
              <ProtectedRoute allow={["Citizen"]}>
                <CitizenPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/construction/apply"
            element={
              <ProtectedRoute allow={["Citizen"]}>
                <CitizenPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/construction/my"
            element={
              <ProtectedRoute allow={["Citizen"]}>
                <CitizenPortal />
              </ProtectedRoute>
            }
          />
          {/* removed /citizen/view-encroachments route */}
          <Route
            path="/department"
            element={
              <ProtectedRoute allow={["UrbanDevelopment"]}>
                <DepartmentPanelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enforcement"
            element={
              <ProtectedRoute allow={["Enforcement"]}>
                <EnforcementPage />
              </ProtectedRoute>
            }
          />
          <Route path="/slumdevelop" element={<SlumDevelopmentPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {isLanding && <Footer />}
    </>
  );
}

export default App;
