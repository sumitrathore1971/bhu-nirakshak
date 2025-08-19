import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Navbar.jsx";
import Overview from "./Overview.jsx";
import Permits from "./Permits.jsx";
import Zoning from "./Zoning.jsx";
import Violations from "./Violations.jsx";
import Inspections from "./Inspections.jsx";
import Regularization from "./Regularization.jsx";
import PlanScrutiny from "./PlanScrutiny.jsx";

export default function UrbanDevelopmentDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  const renderTab = () => {
    switch (activeTab) {
      case "Overview":
        return <Overview />;
      case "Permits":
        return <Permits />;
      case "Zoning":
        return <Zoning />;
      case "Violations":
        return <Violations />;
      case "Inspections":
        return <Inspections />;
      case "Regularization":
        return <Regularization />;
      case "Construction":
        return <PlanScrutiny />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-neutral-950">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}


