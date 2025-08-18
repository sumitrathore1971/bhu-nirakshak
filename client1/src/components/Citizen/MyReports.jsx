import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Eye, X, Loader2, AlertCircle, Trash2 } from "lucide-react";
import reportService from "../../services/reportService.js";
import ReportDetailsModal from "./ReportDetailsModal.jsx";
import FlashMessage from "../FlashMessage.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import socketService from "../../services/socketService.js";

const stages = ["Reported", "Verified", "Action Taken", "Closed"];

export default function MyReports() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [currentPage, statusFilter]);

  // Subscribe to real-time status updates for this user
  useEffect(() => {
    if (!user?.id) return;
    socketService.connect();
    socketService.joinUserRoom(user.id);

    const handleStatusUpdate = (payload) => {
      const { reportId, status, data } = payload || {};
      setReports((prev) =>
        prev.map((r) =>
          r._id === reportId || r.reportId === data?.report?.reportId
            ? { ...r, status: status || data?.report?.status }
            : r
        )
      );
    };

    socketService.onReportStatusUpdated(handleStatusUpdate);

    return () => {
      socketService.offReportStatusUpdated(handleStatusUpdate);
      socketService.disconnect();
    };
  }, [user?.id]);

  async function fetchReports() {
    try {
      setLoading(true);
      setError(null);

      const response = await reportService.getMyReports(
        currentPage,
        10,
        statusFilter
      );
      
      // Debug logging
      console.log('=== MyReports Debug ===');
      console.log('API Response:', response);
      
      // Handle both new and old response formats
      const reports = response.reports || response.data?.reports || [];
      const totalPages = response.totalPages || response.data?.totalPages || 1;

      console.log('Processed reports:', reports);
      console.log('Reports with media:', reports.filter(r => r.media && r.media.length > 0).length);
      
      // Log each report with media
      reports.forEach((report, index) => {
        if (report.media && report.media.length > 0) {
          console.log(`Report ${index + 1} with media:`, {
            reportId: report.reportId,
            title: report.title,
            mediaCount: report.media.length,
            media: report.media
          });
        }
      });

      setReports(reports);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError(error.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getStatusColor(status) {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400";
      case "Verified":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400";
      case "Action Taken":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400";
      case "Closed":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400";
      case "Rejected":
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400";
    }
  }

  // Handle report deletion
  const handleDeleteReport = async (reportId) => {
    try {
      setDeleting(true);
      await reportService.deleteReport(reportId);
      
      // Remove the deleted report from the list
      setReports(reports.filter(report => report._id !== reportId));
      setDeleteConfirm(null);
      
      // Show success notification
      setNotification({
        message: "Report deleted successfully",
        type: "success"
      });
    } catch (error) {
      console.error("Error deleting report:", error);
      setNotification({
        message: error.message || "Failed to delete report",
        type: "error"
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          Loading reports...
        </div>
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Reports
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchReports}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flash Message */}
      <FlashMessage
        message={notification?.message}
        type={notification?.type}
        onClose={() => setNotification(null)}
      />

      

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Action Taken">Action Taken</option>
          <option value="Closed">Closed</option>
          <option value="Rejected">Rejected</option>
        </select>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            Refreshing...
          </div>
        )}
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Report ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
            {reports.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {statusFilter
                    ? `No reports found with status "${statusFilter}"`
                    : "No reports found"}
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr
                  key={report._id}
                  className={`hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors ${
                    report.status !== 'Pending' ? 'opacity-75' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {report.reportId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatDate(report.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    {report.location.area ||
                      report.formattedAddress ||
                      "Location"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelected(report)}
                        className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm inline-flex items-center gap-1"
                      >
                        <Eye size={16} /> View
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(report)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={deleting}
                        title={'Delete report'}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      <ReportDetailsModal
        open={!!selected}
        onClose={() => setSelected(null)}
        report={selected}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Trash2 size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Report
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Are you sure you want to delete this report?
                </p>
                <div className="bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {deleteConfirm.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {deleteConfirm.reportId}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Status: {deleteConfirm.status}
                  </p>
                  
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteReport(deleteConfirm._id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
