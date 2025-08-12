import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Star } from 'lucide-react';

const mockWorkers = [
  { id: 'W-401', name: 'Ravi Kumar', department: 'Town Planning', location: 'Raj Nagar', images: 3, status: 'Verified', points: 120 },
  { id: 'W-402', name: 'Priya Singh', department: 'Revenue', location: 'MP Nagar', images: 1, status: 'Pending', points: 60 },
  { id: 'W-403', name: 'Aman Patel', department: 'IMC', location: 'Arera Colony', images: 2, status: 'Action Taken', points: 95 },
];

export default function WorkerReports() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Worker Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">Ground worker submissions and rewards</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Submissions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Worker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Images</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reward Points</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
              {mockWorkers.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <User size={16} className="text-gray-400" /> {w.name} <span className="text-xs text-gray-500 dark:text-gray-400">({w.id})</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{w.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white flex items-center gap-2"><MapPin size={16} className="text-gray-400" />{w.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{w.images}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      w.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                      w.status === 'Verified' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                      'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                    }`}>{w.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" /> {w.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
