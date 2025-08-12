import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, MapPin, User, X } from 'lucide-react';

const mockReports = [
  { id: 'CASE-201', location: 'Raj Nagar', category: 'Unauthorized Construction', date: '2024-01-18', submittedBy: 'Citizen', status: 'Pending', images: ['1.jpg', '2.jpg'] },
  { id: 'CASE-202', location: 'MP Nagar', category: 'Building Plan Violation', date: '2024-01-17', submittedBy: 'Citizen', status: 'Verified', images: ['3.jpg'] },
  { id: 'CASE-203', location: 'Arera Colony', category: 'Illegal Extension', date: '2024-01-16', submittedBy: 'Citizen', status: 'Action Taken', images: [] },
];

export default function CitizenReports() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = mockReports.filter((r) => {
    const q = query.toLowerCase();
    const matchesQ = r.id.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
    const matchesStatus = status === 'All' || r.status === status;
    const matchesCategory = category === 'All' || r.category === category;
    return matchesQ && matchesStatus && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Citizen Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage public submissions</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by case ID, location, category..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white">
            <option>All</option>
            <option>Pending</option>
            <option>Verified</option>
            <option>Action Taken</option>
            <option>Closed</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white">
            <option>All</option>
            <option>Unauthorized Construction</option>
            <option>Building Plan Violation</option>
            <option>Illegal Extension</option>
            <option>Boundary Violation</option>
          </select>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Case ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{r.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white flex items-center gap-2"><MapPin size={16} className="text-gray-400" />{r.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{r.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{r.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white flex items-center gap-2"><User size={16} className="text-gray-400" />{r.submittedBy}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                      r.status === 'Verified' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                      r.status === 'Action Taken' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' :
                      'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelected(r)} className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">{selected.id}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selected.category}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.location}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Submitted By</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.submittedBy}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Images/Videos</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selected.images.length ? selected.images.map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 dark:bg-neutral-800 rounded-lg" />
                    )) : <p className="text-sm text-gray-500 dark:text-gray-400">No media available</p>}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-neutral-800">
                  <button className="px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">Assign to Enforcement</button>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">Verify Case</button>
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">Merge Reports</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
