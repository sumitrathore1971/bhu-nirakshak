import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Edit, Trash, Shield, User, Mail, Key, X } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Admin User', email: 'admin@imc.gov.in', role: 'admin', lastLogin: '2024-01-18 10:20' },
  { id: 2, name: 'Officer One', email: 'officer@imc.gov.in', role: 'enforcement', lastLogin: '2024-01-18 09:12' },
  { id: 3, name: 'Worker One', email: 'worker@imc.gov.in', role: 'worker', lastLogin: '2024-01-17 18:00' },
];

export default function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (user) => { setEditing(user); setModalOpen(true); };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Create, edit and manage users</p>
          </div>
          <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"><UserPlus size={16}/> New User</button>
        </div>
      </motion.div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white flex items-center gap-2"><User size={16} className="text-gray-400"/>{u.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white flex items-center gap-2"><Mail size={16} className="text-gray-400"/>{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white flex items-center gap-2"><Shield size={16} className="text-gray-400"/>{u.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{u.lastLogin}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(u)} className="px-3 py-2 bg-gray-100 dark:bg-neutral-800 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 text-sm mr-2 inline-flex items-center gap-1"><Edit size={14}/> Edit</button>
                    <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm inline-flex items-center gap-1"><Trash size={14}/> Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">{editing ? 'Edit User' : 'Create User'}</h3>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"><X size={20} className="text-gray-500 dark:text-gray-400"/></button>
              </div>
              <div className="p-6 space-y-4">
                <input defaultValue={editing?.name || ''} placeholder="Full name" className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white" />
                <input defaultValue={editing?.email || ''} placeholder="Email" className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white" />
                <select defaultValue={editing?.role || 'citizen'} className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white">
                  <option value="citizen">citizen</option>
                  <option value="enforcement">enforcement</option>
                  <option value="worker">worker</option>
                  <option value="admin">admin</option>
                </select>
                <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">Login History</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between bg-gray-50 dark:bg-neutral-800 rounded-lg px-4 py-3">
              <span>{u.name} ({u.email})</span>
              <span className="text-gray-500 dark:text-gray-400">Last login: {u.lastLogin}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
