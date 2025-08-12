import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function ReportDetailsModal({ open, onClose, report }) {
  if (!open || !report) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">{report.id}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"><X size={20} className="text-gray-500 dark:text-gray-400"/></button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">More details can be shown here.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
