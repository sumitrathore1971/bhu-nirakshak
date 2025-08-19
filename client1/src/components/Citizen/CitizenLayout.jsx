import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Chatbot from '../Chatbot';

export default function CitizenLayout({ children, activePage, setActivePage }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Citizen Portal</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bhu-Nirakshak</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Welcome,</span>
                <span className="font-medium text-gray-900 dark:text-white">Citizen</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      {/* AI Chatbot */}
      <Chatbot />
    </div>
  );
}
