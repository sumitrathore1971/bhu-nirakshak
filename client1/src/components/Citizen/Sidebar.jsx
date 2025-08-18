import { motion } from "framer-motion";
import {
  FileText,
  FolderOpen,
  Search,
  HelpCircle,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  {
    id: "report",
    label: "Report Encroachment",
    icon: FileText,
    path: "/citizen/report",
  },
  {
    id: "my-reports",
    label: "My Reports",
    icon: FolderOpen,
    path: "/citizen/my-reports",
  },
  { id: "track", label: "Track Case", icon: Search, path: "/citizen/track" },
  {
    id: "help",
    label: "Help & Guidelines",
    icon: HelpCircle,
    path: "/citizen/help",
  },
  { id: "profile", label: "Profile", icon: User, path: "/citizen/profile" },
];

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  activePage,
  setActivePage,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleNavigation = (item) => {
    setActivePage(item.id);
    navigate(item.path);
  };

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen bg-white dark:bg-neutral-950 border-r border-gray-200 dark:border-neutral-800 shadow-lg"
    >
      <div className="flex flex-col h-full">
        <div className="p-5 border-b border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
                  <img src="/assets/logo.png" alt="logo" />
                </div>
                <div>
                  <span className="font-heading font-bold text-lg text-gray-900 dark:text-white">
                    Bhu-Nirakshak
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Citizen Portal
                  </p>
                </div>
              </motion.div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight
                  size={20}
                  className="text-gray-600 dark:text-gray-300"
                />
              ) : (
                <ChevronLeft
                  size={20}
                  className="text-gray-600 dark:text-gray-300"
                />
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activePage === item.id
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon size={20} />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={20} />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium"
              >
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
