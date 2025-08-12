import { motion } from 'framer-motion';
import { BarChart3, PieChart, Download } from 'lucide-react';

export default function AdminAnalytics() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Insights across reports, enforcement and workers</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Monthly Reports</h2>
            <button className="px-3 py-1 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 text-sm">Export</button>
          </div>
          <div className="h-64 bg-gray-50 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-gray-400" size={48} />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">High-Risk Areas</h2>
            <button className="px-3 py-1 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 text-sm">Export</button>
          </div>
          <div className="h-64 bg-gray-50 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
            <PieChart className="text-gray-400" size={48} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Success Rate</h2>
          <button className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"><Download size={16}/> Export All</button>
        </div>
        <div className="h-64 bg-gray-50 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
          <BarChart3 className="text-gray-400" size={48} />
        </div>
      </div>
    </div>
  );
}
