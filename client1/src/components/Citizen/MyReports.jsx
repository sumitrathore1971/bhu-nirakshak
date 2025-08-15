import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Eye, X, Loader2, AlertCircle } from "lucide-react";
import reportService from "../../services/reportService.js";

const stages = ["Reported", "Verified", "Action Taken", "Closed"];

export default function MyReports() {
  const [selected, setSelected] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchReports();
  }, [currentPage, statusFilter]);

  async function fetchReports() {
    try {
      setLoading(true);
      setError(null);

      const response = await reportService.getMyReports(
        currentPage,
        10,
        statusFilter
      );
      // Handle both new and old response formats
      const reports = response.reports || response.data?.reports || [];
      const totalPages = response.totalPages || response.data?.totalPages || 1;

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
    <div className="space-y-4">
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
                Case ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3" />
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
                  className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
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
                    <button
                      onClick={() => setSelected(report)}
                      className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm inline-flex items-center gap-1"
                    >
                      <Eye size={16} /> View Details
                    </button>
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
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">
                    {selected.reportId}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selected.title}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Category
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selected.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Status
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selected.status
                      )}`}
                    >
                      {selected.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Date Observed
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(selected.dateOfObservation)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Submitted
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(selected.createdAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
                    {selected.description}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Location
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    {selected.location.area ||
                      selected.formattedAddress ||
                      "Location coordinates"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Status Timeline
                  </p>
                  <div className="flex items-center">
                    {stages.map((stage, idx) => (
                      <div key={stage} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full grid place-items-center text-xs font-semibold ${
                            idx <= selected.stage
                              ? "bg-primary text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        {idx < stages.length - 1 && (
                          <div
                            className={`w-10 h-1 ${
                              idx < selected.stage
                                ? "bg-primary"
                                : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    Current Stage: {stages[selected.stage] || selected.status}
                  </div>
                </div>

                {selected.media && selected.media.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Images/Videos
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selected.media.map((media, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-gray-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center"
                        >
                          <span className="text-xs text-gray-500">
                            {media.originalName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selected.notes && selected.notes.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Notes
                    </p>
                    <div className="space-y-2">
                      {selected.notes.map((note, i) => (
                        <div
                          key={i}
                          className="bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg"
                        >
                          <p className="text-sm text-gray-900 dark:text-white">
                            {note.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {note.addedBy?.name || "System"} •{" "}
                            {formatDate(note.addedAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
