import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  MapPin,
  Calendar,
  User,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import reportService from "../../services/reportService.js";
import { notificationEvents } from "./NotificationPanel.jsx"; // Import the global event system

export default function CitizenReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch reports from API
  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (status !== "All") filters.status = status;
      if (category !== "All") filters.category = category;

      const response = await reportService.getAllReports(
        page,
        pagination.limit,
        filters
      );

      // Handle both new and old response formats
      if (response.success || response.data) {
        const data = response.data || response;
        setReports(data.reports || []);
        setPagination({
          page: data.currentPage || 1,
          limit: data.limit || 10,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        });
      } else {
        setError(response.message || "Failed to fetch reports");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  // Handle new report notifications
  const handleNewReport = (data) => {
    console.log("📢 Received new report notification:", data);
    // Add the new report to the beginning of the list
    setReports((prev) => [data.report, ...prev.slice(0, -1)]); // Keep the same number of items
  };

  // Subscribe to global notification events
  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe(handleNewReport);
    return unsubscribe;
  }, []);

  // Fetch reports on component mount and when filters change
  useEffect(() => {
    fetchReports(1);
  }, [status, category]);

  // Filter reports based on search query
  const filteredReports = reports.filter((report) => {
    const q = query.toLowerCase();
    const matchesQ =
      report.reportId?.toLowerCase().includes(q) ||
      report.location?.area?.toLowerCase().includes(q) ||
      report.category?.toLowerCase().includes(q) ||
      report.title?.toLowerCase().includes(q) ||
      report.reporter?.fullName?.toLowerCase().includes(q);
    return matchesQ;
  });

  const handleRefresh = () => {
    fetchReports(pagination.page);
  };

  const handlePageChange = (newPage) => {
    fetchReports(newPage);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400";
      case "Verified":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400";
      case "Action Taken":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400";
      case "Closed":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
            Citizen Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage public submissions
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by case ID, location, category..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Verified</option>
            <option>Action Taken</option>
            <option>Closed</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
          >
            <option>All</option>
            <option>Unauthorized Construction</option>
            <option>Building Plan Violation</option>
            <option>Illegal Extension</option>
            <option>Boundary Violation</option>
          </select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">
            Reports
          </h2>
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">
              {error}
            </p>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading reports...
            </p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No reports found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
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
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Submitted By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
                  {filteredReports.map((report) => (
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
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        {report.location?.area || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {report.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {formatDate(report.dateOfObservation)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        {report.reporter?.fullName || "Anonymous"}
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
                          className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-neutral-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-neutral-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* NotificationPanel is now a global component, so we don't need to import it here */}
      {/* <NotificationPanel /> */}

      {/* The socket connection setup for new reports is now handled by NotificationPanel */}
      {/* <useEffect> block for socketService.onNewReport is removed */}

      {/* The selected report modal */}
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
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">
                  {selected.reportId}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selected.category}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Title
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selected.title}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selected.status
                      )}`}
                    >
                      {selected.status}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Location
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selected.location?.area || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Submitted By
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selected.reporter?.fullName || "Anonymous"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(selected.dateOfObservation)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selected.reporter?.phone || "N/A"}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Description
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selected.description}
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-neutral-800">
                <button className="px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
                  Assign to Enforcement
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Verify Case
                </button>
                <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                  Merge Reports
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
