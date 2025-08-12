import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Eye, X } from 'lucide-react';

const mockMyReports = [
  { id: 'BN-2024-AB123', date: '2024-01-16', location: 'Raj Nagar', status: 'Verified', media: 2, stage: 2 },
  { id: 'BN-2024-CD456', date: '2024-01-15', location: 'MP Nagar', status: 'Pending', media: 0, stage: 1 },
  { id: 'BN-2024-EF789', date: '2024-01-12', location: 'Arera Colony', status: 'Action Taken', media: 3, stage: 3 },
];

const stages = ['Reported', 'Verified', 'Action Taken', 'Closed'];

export default function MyReports() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Case ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
            {mockMyReports.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{r.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{r.date}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white flex items-center gap-2"><MapPin size={16} className="text-gray-400" />{r.location}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    r.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                    r.status === 'Verified' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                    r.status === 'Action Taken' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' :
                    'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                  }`}>{r.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setSelected(r)} className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm inline-flex items-center gap-1"><Eye size={16}/> View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">{selected.id}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Location: {selected.location}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"><X size={20} className="text-gray-500 dark:text-gray-400"/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status Timeline</p>
                  <div className="flex items-center">
                    {stages.map((s, idx) => (
                      <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full grid place-items-center text-xs font-semibold ${idx <= selected.stage ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>{idx + 1}</div>
                        {idx < stages.length - 1 && (
                          <div className={`w-10 h-1 ${idx < selected.stage ? 'bg-primary' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">Current Stage: {stages[selected.stage]}</div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Estimated time to next step: 2-3 days</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Images/Videos</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: selected.media || 0 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 dark:bg-neutral-800 rounded-lg" />
                    ))}
                    {selected.media === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No media uploaded</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
