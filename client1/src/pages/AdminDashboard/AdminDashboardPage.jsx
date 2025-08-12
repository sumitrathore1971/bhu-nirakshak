import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../../components/Admin/Sidebar';
import Navbar from '../../components/Admin/Navbar';
import Dashboard from '../../components/Admin/Dashboard';
import CitizenReports from '../../components/Admin/CitizenReports';
import EnforcementActivity from '../../components/Admin/EnforcementActivity';
import WorkerReports from '../../components/Admin/WorkerReports';
import Analytics from '../../components/Admin/Analytics';
import UserManagement from '../../components/Admin/UserManagement';
import Settings from '../../components/Admin/Settings';

export default function AdminDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'citizen': return <CitizenReports />;
      case 'enforcement': return <EnforcementActivity />;
      case 'worker': return <WorkerReports />;
      case 'analytics': return <Analytics />;
      case 'users': return <UserManagement />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  const handleSearch = (q) => {
    console.log('Admin search:', q);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-neutral-950">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} onSearch={handleSearch} />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activePage} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}