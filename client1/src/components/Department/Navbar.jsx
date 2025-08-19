import { motion } from "framer-motion";
import { Menu, LogOut, User } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Navbar({ isCollapsed, setIsCollapsed }) {
  const { logout } = useAuth();
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-neutral-950 shadow-lg border-b border-gray-200 dark:border-neutral-800 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Urban Development Department</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Construction compliance, zoning & regulations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-input bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
            <span className="text-sm">Dept. Officer</span>
          </div>
          <Button variant="destructive" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}


