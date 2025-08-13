import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Navbar({ isCollapsed, setIsCollapsed, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) onSearch(searchQuery);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-neutral-950 shadow-lg border-b border-gray-200 dark:border-neutral-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <Menu size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage platform activity & users</p>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search cases, users, or reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md">
            <User size={16} className="text-white" />
          </div>
          <Button onClick={handleLogout} variant="destructive" className="px-3 py-2">
            Logout
          </Button>
        </div>
      </div>

      <div className="mt-4 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search cases, users, or reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </form>
      </div>
    </motion.nav>
  );
}
