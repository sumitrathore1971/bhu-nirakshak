import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash, Shield, User, Mail, X, ClipboardCheck } from 'lucide-react';
import reportService from '../../services/reportService.js';
import { getApiBaseUrl } from '../../lib/utils.js';
import { useAuth } from '../../context/AuthContext.jsx';

const API_BASE_URL = getApiBaseUrl();

export default function UserManagement() {
  const { showFlashMessage } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editRole, setEditRole] = useState('Citizen');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Assign modal state
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reportOptions, setReportOptions] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState('');

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openEdit = (user) => {
    setEditing(user);
    setEditRole(user?.role || 'Citizen');
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setModalOpen(true);
  };

  // Fetch users from backend (admin only route)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'GET',
          headers: reportService.getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to fetch users');
        }
        setUsers(Array.isArray(data?.users) ? data.users : []);
      } catch (e) {
        console.error('Error loading users:', e);
        setError(e?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const openAssignForUser = async (user) => {
    setSelectedUser(user);
    setAssignOpen(true);
    setSelectedReportId('');
    try {
      setReportsLoading(true);
      // Fetch pending reports, then filter unassigned client-side
      const res = await reportService.getAllReports(1, 50, { status: 'Pending' });
      const reports = res?.data?.reports || res?.reports || [];
      const unassigned = reports.filter((r) => !r.assignedTo);
      setReportOptions(unassigned);
    } catch (e) {
      console.error('Failed to load reports for assignment:', e);
      setReportOptions([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const confirmAssign = async () => {
    if (!selectedUser?._id || !selectedReportId) return;
    try {
      setAssignLoading(true);
      await reportService.assignReport(selectedReportId, selectedUser._id);
      setAssignOpen(false);
      setSelectedUser(null);
      setSelectedReportId('');
    } catch (e) {
      console.error('Assignment failed:', e);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editing?._id) return;
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/users/${editing._id}`, {
        method: 'PUT',
        headers: reportService.getAuthHeaders(),
        body: JSON.stringify({ name: editName, email: editEmail, role: editRole })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update user');
      }
      const updatedUser = data?.user || null;
      if (updatedUser) {
        setUsers((prev) => prev.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
      }
      setModalOpen(false);
      setEditing(null);
      showFlashMessage('User changes saved successfully.', 'success');
    } catch (e) {
      console.error('Failed to save user:', e);
      showFlashMessage(e?.message || 'Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-start">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Create, edit and manage users</p>
          </div>
        </div>
      </motion.div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-gray-600 dark:text-gray-400">Loading users…</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : (
            <table className="w-full">
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2"><User size={16} className="text-gray-400"/>{u.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2"><Mail size={16} className="text-gray-400"/>{u.email}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2"><Shield size={16} className="text-gray-400"/>
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs border border-gray-200 dark:border-neutral-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(u)} className="px-3 py-2 bg-gray-100 dark:bg-neutral-800 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 text-sm mr-2 inline-flex items-center gap-1"><Edit size={14}/> Edit</button>
                      {u.role === 'Enforcement' && (
                        <button onClick={() => openAssignForUser(u)} className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm mr-2 inline-flex items-center gap-1"><ClipboardCheck size={14}/> Assign Task</button>
                      )}
                      <button onClick={() => setDeleteConfirm(u)} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm inline-flex items-center gap-1"><Trash size={14}/> Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white" />
                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white" />
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white">
                  <option value="Citizen">Citizen</option>
                  <option value="Enforcement">Enforcement</option>
                  <option value="Admin">Admin</option>
                </select>
                <button onClick={handleSave} disabled={saving} className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Task Modal */}
      <AnimatePresence>
        {assignOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setAssignOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Assign Task</h3>
                <button onClick={() => setAssignOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"><X size={20} className="text-gray-500 dark:text-gray-400"/></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Assign a pending unassigned report to <span className="font-semibold">{selectedUser?.name}</span>
                </div>
                {reportsLoading ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">Loading available tasks…</div>
                ) : (
                  <select value={selectedReportId} onChange={(e) => setSelectedReportId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white">
                    <option value="" disabled>Select a report…</option>
                    {reportOptions.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.title || 'Untitled'} – {r.category} – {new Date(r.createdAt).toLocaleString()}
                      </option>
                    ))}
                  </select>
                )}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button onClick={() => setAssignOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50" disabled={assignLoading}>Cancel</button>
                  <button onClick={confirmAssign} disabled={assignLoading || !selectedReportId} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm inline-flex items-center gap-2 disabled:opacity-50">
                    <ClipboardCheck size={16}/>
                    {assignLoading ? 'Assigning…' : 'Assign'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Delete User</h3>
                <button onClick={() => setDeleteConfirm(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"><X size={20} className="text-gray-500 dark:text-gray-400"/></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">Are you sure you want to delete <span className="font-semibold">{deleteConfirm?.name}</span>? This action cannot be undone.</p>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50" disabled={deleting}>Cancel</button>
                  <button onClick={async () => {
                    try {
                      setDeleting(true);
                      const response = await fetch(`${API_BASE_URL}/users/${deleteConfirm._id}`, {
                        method: 'DELETE',
                        headers: reportService.getAuthHeaders(),
                      });
                      const data = await response.json();
                      if (!response.ok) {
                        throw new Error(data?.message || 'Failed to delete user');
                      }
                      setUsers((prev) => prev.filter((u) => u._id !== deleteConfirm._id));
                      setDeleteConfirm(null);
                      showFlashMessage('User deleted successfully.', 'success');
                    } catch (err) {
                      console.error('Failed to delete user:', err);
                      showFlashMessage(err?.message || 'Failed to delete user', 'error');
                    } finally {
                      setDeleting(false);
                    }
                  }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm inline-flex items-center gap-2 disabled:opacity-50" disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
