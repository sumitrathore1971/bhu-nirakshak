import { motion } from "framer-motion";

export function Card({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`rounded-2xl bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 shadow-md hover:shadow-lg transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Scheduled: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    Completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Delayed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    Approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    "Action Taken": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    Closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"}`}>
      {status}
    </span>
  );
}

export function SectionHeader({ title, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-xl bg-accent text-accent-foreground dark:bg-accent/50">
        {Icon ? <Icon className="h-5 w-5" /> : null}
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}


