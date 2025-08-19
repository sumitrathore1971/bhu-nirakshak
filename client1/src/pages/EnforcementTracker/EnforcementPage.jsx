import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../components/Enforcement/Sidebar";
import Navbar from "../../components/Enforcement/Navbar";
import Dashboard from "../../components/Enforcement/Dashboard";
import CaseManagement from "../../components/Enforcement/CaseManagement";
import DroneOperations from "../../components/Enforcement/DroneOperations";
import Analytics from "../../components/Enforcement/Analytics";
import Settings from "../../components/Enforcement/Settings";

export default function EnforcementPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [pageError, setPageError] = useState(false);

  const renderPage = () => {
    try {
      switch (activePage) {
        case "dashboard":
          return <Dashboard />;
        case "cases":
          return <CaseManagement />;
        case "drones":
          return <DroneOperations />;
        case "analytics":
          return <Analytics />;
        case "settings":
          return <Settings />;
        default:
          return <Dashboard />;
      }
    } catch (error) {
      console.error(`Error rendering ${activePage} page:`, error);
      setPageError(true);
      return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-screen">
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
            Error Loading{" "}
            {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load the {activePage} page. Please try again later.
          </p>
          <button
            onClick={() => {
              setPageError(false);
              setActivePage("dashboard");
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      );
    }
  };

  const handleSearch = (query) => {
    console.log("Search query:", query);
    // Implement search functionality
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onSearch={handleSearch}
        />

        {/* Page Content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
