import { useState } from "react";
import { motion } from "framer-motion";
import { User, Search, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NotificationPanel from "../Admin/NotificationPanel.jsx";

export default function Navbar({ isCollapsed, setIsCollapsed, onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-neutral-950 shadow-lg border-b border-gray-200 dark:border-neutral-800 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-300" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
              Enforcement Portal
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bhu-Nirakshak
            </p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search cases, locations, or case IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Enforcement Officer
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                IMC Staff
              </p>
            </div>

            {/* Notifications */}
            <NotificationPanel />
          </div>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="px-3 py-2"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="mt-4 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search cases, locations, or case IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </form>
      </div>
    </motion.nav>
  );
}
