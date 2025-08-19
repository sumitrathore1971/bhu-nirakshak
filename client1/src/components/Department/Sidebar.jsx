import { motion } from "framer-motion";
import { LayoutDashboard, FileCheck, Map, AlertTriangle, ClipboardCheck, ChevronLeft, ChevronRight } from "lucide-react";

const menuItems = [
  { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'Permits', label: 'Permits', icon: FileCheck },
  { id: 'Zoning', label: 'Zoning', icon: Map },
  { id: 'Violations', label: 'Violations', icon: AlertTriangle },
  { id: 'Inspections', label: 'Inspections', icon: ClipboardCheck },
  { id: 'Regularization', label: 'Regularization', icon: FileCheck },
  { id: 'Construction', label: 'Construction Plans', icon: FileCheck },
];

export default function Sidebar({ isCollapsed, setIsCollapsed, activeTab, setActiveTab }) {
  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="flex h-screen bg-white dark:bg-neutral-950 border-r border-gray-200 dark:border-neutral-800 shadow-lg"
    >
      <div className="flex flex-col h-full w-full">
        <div className="p-5 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md overflow-hidden">
                <img src="/assets/logo.png" alt="logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-heading font-bold text-base">Bhu-Nirakshak</span>
                <p className="text-xs text-muted-foreground">Urban Development</p>
              </div>
            </motion.div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-neutral-800 text-center text-sm text-muted-foreground">
            Dept. Dashboard
          </div>
        )}
      </div>
    </motion.aside>
  );
}


