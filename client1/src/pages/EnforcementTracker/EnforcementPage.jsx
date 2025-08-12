import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/Enforcement/Sidebar';
import Navbar from '../../components/Enforcement/Navbar';
import Dashboard from '../../components/Enforcement/Dashboard';
import CaseManagement from '../../components/Enforcement/CaseManagement';
import DroneOperations from '../../components/Enforcement/DroneOperations';
import Analytics from '../../components/Enforcement/Analytics';
import Settings from '../../components/Enforcement/Settings';

export default function EnforcementPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'cases':
        return <CaseManagement />;
      case 'drones':
        return <DroneOperations />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const handleSearch = (query) => {
    console.log('Search query:', query);
    // Implement search functionality
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onSearch={handleSearch}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
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