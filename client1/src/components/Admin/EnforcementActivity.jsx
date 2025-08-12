import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, AlertTriangle, CheckCircle, Clock, Image as ImageIcon } from 'lucide-react';

const mockEnforcement = [
  { id: 'ENF-301', stage: 'Inspection Scheduled', officer: 'Officer A', due: '2024-01-18', overdue: false, ticket: 'Issued', photos: 3 },
  { id: 'ENF-302', stage: 'Notice Served', officer: 'Officer B', due: '2024-01-15', overdue: true, ticket: 'Pending', photos: 1 },
  { id: 'ENF-303', stage: 'Action In Progress', officer: 'Officer C', due: '2024-01-19', overdue: false, ticket: 'Issued', photos: 5 },
];

export default function EnforcementActivity() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Enforcement Activity</h1>
        <p className="text-gray-600 dark:text-gray-400">Track ongoing enforcement cases</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
        {mockEnforcement.map((c) => (
          <div key={c.id} className={`bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border ${c.overdue ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-neutral-800'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{c.id}</h3>
                  {c.overdue && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">Overdue</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Stage</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{c.stage}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Officer</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{c.officer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due By</p>
                      <p className={`text-sm font-medium ${c.overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{c.due}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ticket</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${c.ticket === 'Issued' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'}`}>{c.ticket}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-lg text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <ImageIcon size={14} /> {c.photos}
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
