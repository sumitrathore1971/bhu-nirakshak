import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Clock,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  User,
  Download,
  RefreshCw,
  Send,
  X,
  Image as ImageIcon,
} from "lucide-react";
import socketService from "../../services/socketService.js";
import reportService from "../../services/reportService.js";
import { useAuth } from "../../context/AuthContext";
import { getStaticBaseUrl } from "../../lib/utils.js";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Remove mock data - we'll use real data from socket and API

const statusColors = {
  Pending:
    "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400",
  "In Progress":
    "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400",
  Verified: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400",
  "Action Taken":
    "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400",
  Closed:
    "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400",
};

export default function CaseManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [cases, setCases] = useState([]); // Start with empty array
  const [loading, setLoading] = useState(true);
  const [showClosedCases, setShowClosedCases] = useState(false);
  const [newAssignmentNotification, setNewAssignmentNotification] =
    useState(null);
  const { showFlashMessage } = useAuth() || { showFlashMessage: () => {} };

  // Geometry preview state for selected case
  const [geometry, setGeometry] = useState(null);
  const [geomError, setGeomError] = useState("");
  const [geomLoading, setGeomLoading] = useState(false);

  // MiniMap to render polygon geometry (non-interactive)
  function MiniMap({ geometry, color = "#3b82f6" }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const token = import.meta.env.VITE_MAPBOX_TOKEN;

    const bbox = useMemo(() => {
      try {
        const coords = geometry?.coordinates?.[0] || [];
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        coords.forEach(([x, y]) => {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        });
        if (!isFinite(minX)) return null;
        return [
          [minX, minY],
          [maxX, maxY],
        ];
      } catch {
        return null;
      }
    }, [geometry]);

    useEffect(() => {
      if (!token || !containerRef.current || mapRef.current) return;
      mapboxgl.accessToken = token;
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [75.8577, 22.7196],
        zoom: 10,
        interactive: false,
      });
      mapRef.current = map;

      map.on("load", () => {
        const id = `poly-${Math.random().toString(36).slice(2)}`;
        map.addSource(id, {
          type: "geojson",
          data: { type: "Feature", geometry, properties: {} },
        });
        map.addLayer({
          id: `${id}-fill`,
          type: "fill",
          source: id,
          paint: { "fill-color": color, "fill-opacity": 0.35 },
        });
        map.addLayer({
          id: `${id}-line`,
          type: "line",
          source: id,
          paint: { "line-color": color, "line-width": 2 },
        });

        if (bbox) {
          map.fitBounds(bbox, { padding: 10, duration: 0 });
        }
      });

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }, [token]);

    if (!token) {
      return (
        <div className="w-full h-40 rounded-md overflow-hidden border border-gray-200 dark:border-neutral-800 grid place-items-center text-xs text-gray-600 dark:text-gray-400">
          Set VITE_MAPBOX_TOKEN to view polygon map
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className="w-full h-40 rounded-md overflow-hidden border border-gray-200 dark:border-neutral-800"
      />
    );
  }

  // Function to fetch existing assigned reports from backend
  const fetchAssignedReports = async () => {
    try {
      setLoading(true);
      // Load cases from localStorage first
      try {
        const savedCases = localStorage.getItem("enforcementCases");
        if (savedCases) {
          const parsedCases = JSON.parse(savedCases);
          console.log("📋 Loaded cases from localStorage:", parsedCases);
          setCases(parsedCases);
        }
      } catch (localStorageError) {
        console.warn("localStorage not available:", localStorageError);
        setCases([]);
      }
      // TODO: Replace with actual API endpoint for fetching enforcement cases
      // For now, we'll rely on real-time socket data and localStorage
      console.log("📋 Fetching assigned reports for enforcement");
    } catch (error) {
      console.error("Error fetching assigned reports:", error);
      showFlashMessage("Failed to fetch assigned reports", "error");
    } finally {
      setLoading(false);
    }
  };

  // Function to save cases to localStorage
  const saveCasesToStorage = (casesToSave) => {
    try {
      localStorage.setItem("enforcementCases", JSON.stringify(casesToSave));
      console.log("📋 Saved cases to localStorage:", casesToSave);
    } catch (error) {
      console.error("Error saving cases to localStorage:", error);
      // Don't throw error, just log it
    }
  };

  // Function to add a new case to the list
  const addCaseToList = (reportData) => {
    console.log("📋 addCaseToList called with:", reportData);
    const newCase = {
      backendId: reportData._id,
      id: reportData.reportId || reportData.id || `CASE-${Date.now()}`,
      location:
        reportData.location?.address ||
        reportData.location?.area ||
        "Location not specified",
      violationType:
        reportData.category ||
        reportData.violationType ||
        "Illegal Construction",
      submittedBy:
        reportData.reporter?.fullName || reportData.submittedBy || "Citizen",
      riskScore: reportData.riskScore || Math.floor(Math.random() * 30) + 70, // Default risk score
      status: "Pending", // Default status for new assignments
      date: new Date(reportData.createdAt || reportData.timestamp || Date.now())
        .toISOString()
        .split("T")[0],
      description:
        reportData.description || reportData.title || "No description provided",
      photos: reportData.media || reportData.photos || reportData.images || [],
      actionHistory: [
        {
          action: "Assigned to Enforcement",
          date: new Date().toISOString().split("T")[0],
          officer: "Admin",
        },
      ],
      // Store the original report data for reference
      originalReport: reportData,
    };

    console.log("📋 Adding new case to enforcement list:", newCase);
    setCases((prev) => {
      const updatedCases = [newCase, ...prev];
      console.log("📋 Updated cases array:", updatedCases);
      // Save to localStorage
      saveCasesToStorage(updatedCases);
      return updatedCases;
    });

    // Show notification for new assignment
    setNewAssignmentNotification(newCase);
    showFlashMessage(
      `New case ${newCase.id} assigned to enforcement`,
      "success"
    );

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNewAssignmentNotification(null);
    }, 5000);
  };

  // Function to remove a case (when closed)
  const removeCase = (caseId) => {
    setCases((prev) => {
      const updatedCases = prev.filter((caseItem) => caseItem.id !== caseId);
      saveCasesToStorage(updatedCases);
      return updatedCases;
    });
  };

  // Function to update case status
  const updateCaseStatus = (caseId, newStatus) => {
    setCases((prev) => {
      const updatedCases = prev.map((caseItem) =>
        caseItem.id === caseId
          ? {
              ...caseItem,
              status: newStatus,
              actionHistory: [
                ...caseItem.actionHistory,
                {
                  action: `Status changed to ${newStatus}`,
                  date: new Date().toISOString().split("T")[0],
                  officer: "Enforcement Officer",
                },
              ],
            }
          : caseItem
      );
      saveCasesToStorage(updatedCases);
      return updatedCases;
    });

    // Show success message
    showFlashMessage(
      `Case ${caseId} status updated to ${newStatus}`,
      "success"
    );
  };

  // Function to start working on a case
  const startWorkingOnCase = (caseId) => {
    updateCaseStatus(caseId, "In Progress");
  };

  // Function to add a note to a case
  const addNoteToCase = (caseId, noteContent) => {
    setCases((prev) => {
      const updatedCases = prev.map((caseItem) =>
        caseItem.id === caseId
          ? {
              ...caseItem,
              actionHistory: [
                ...caseItem.actionHistory,
                {
                  action: `Note: ${noteContent}`,
                  date: new Date().toISOString().split("T")[0],
                  officer: "Enforcement Officer",
                  isNote: true,
                },
              ],
            }
          : caseItem
      );
      saveCasesToStorage(updatedCases);
      return updatedCases;
    });

    showFlashMessage("Note added to case", "success");
  };

  // Function to mark case as urgent
  const markCaseAsUrgent = (caseId) => {
    setCases((prev) => {
      const updatedCases = prev.map((caseItem) =>
        caseItem.id === caseId
          ? {
              ...caseItem,
              actionHistory: [
                ...caseItem.actionHistory,
                {
                  action: "Marked as Urgent",
                  date: new Date().toISOString().split("T")[0],
                  officer: "Enforcement Officer",
                },
              ],
              isUrgent: true,
            }
          : caseItem
      );
      saveCasesToStorage(updatedCases);
      return updatedCases;
    });

    showFlashMessage("Case marked as urgent", "success");
  };

  // Function to check if a file is an image
  const isImage = (mimeType) => {
    return (
      mimeType && typeof mimeType === "string" && mimeType.startsWith("image/")
    );
  };

  // Function to get the full URL for media files
  const getMediaUrl = (mediaItem) => {
    // Handle string media entries (e.g., just a filename or path)
    if (typeof mediaItem === "string") {
      const value = mediaItem.trim();
      const baseUrl = getStaticBaseUrl();
      if (value.startsWith("http://") || value.startsWith("https://"))
        return value;
      if (value.startsWith("/uploads/")) return `${baseUrl}${value}`;
      // assume bare filename
      return `${baseUrl}/uploads/${value}`;
    }
    if (mediaItem && typeof mediaItem === "object") {
      if (mediaItem.url) {
        // If it's already a full URL, use it as is
        if (
          mediaItem.url.startsWith("http://") ||
          mediaItem.url.startsWith("https://")
        ) {
          return mediaItem.url;
        }
        // If it's a relative path, construct the full URL
        if (mediaItem.url.startsWith("/uploads/")) {
          const baseUrl = getStaticBaseUrl();
          return `${baseUrl}${mediaItem.url}`;
        }
      }
      // Fallback to filename when url is missing or not recognized
      if (mediaItem.filename) {
        const baseUrl = getStaticBaseUrl();
        return `${baseUrl}/uploads/${mediaItem.filename}`;
      }
    }
    return null;
  };

  const getFileExtension = (name) => {
    if (!name || typeof name !== "string") return "";
    const idx = name.lastIndexOf(".");
    return idx >= 0 ? name.slice(idx + 1).toLowerCase() : "";
  };

  const looksLikeImageByName = (name) => {
    const ext = getFileExtension(name);
    return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext);
  };

  const normalizeMediaItem = (item) => {
    if (typeof item === "string") {
      const url = getMediaUrl(item);
      const originalName = item.split("/").pop();
      const mimeType = looksLikeImageByName(originalName)
        ? `image/${getFileExtension(originalName)}`
        : undefined;
      return {
        filename: originalName,
        originalName,
        mimeType,
        size: 0,
        url,
      };
    }
    if (item && typeof item === "object") {
      const url = getMediaUrl(item);
      return {
        filename: item.filename || item.name || item.url || "",
        originalName: item.originalName || item.name || item.filename || "",
        mimeType: item.mimeType || item.type,
        size: item.size || 0,
        url,
      };
    }
    return null;
  };

  const resolveCaseMedia = (caseItem) => {
    const rawMedia =
      caseItem.photos && caseItem.photos.length > 0
        ? caseItem.photos
        : caseItem.originalReport?.media ||
          caseItem.originalReport?.photos ||
          caseItem.originalReport?.images ||
          [];
    return (rawMedia || []).map(normalizeMediaItem).filter(Boolean);
  };

  useEffect(() => {
    // Fetch existing assigned reports
    fetchAssignedReports();

    // Setup socket connection
    try {
      socketService.connect();
      socketService.joinEnforcementRoom();
    } catch (error) {
      console.warn("Socket service not available:", error);
    }

    const handleAssignToEnforcement = (data) => {
      console.log(
        "📋 Received assignToEnforcement event in CaseManagement:",
        data
      );
      try {
        console.log(
          "📋 Socket service state:",
          socketService.getConnectionStatus()
        );
      } catch (error) {
        console.warn("Error getting socket status:", error);
      }
      if (data && data.report) {
        console.log("📋 Processing report data:", data.report);
        // Add the new case to the list (notification bell will handle the user notification)
        addCaseToList(data.report);
      } else {
        console.log("📋 Invalid data received:", data);
      }
    };

    // Ensure socket is connected before setting up listener
    const setupSocketListener = () => {
      try {
        if (socketService.socket && socketService.socket.connected) {
          console.log("📋 Setting up socket listener for assignToEnforcement");
          socketService.socket.on(
            "assignToEnforcement",
            handleAssignToEnforcement
          );
        } else {
          console.log("📋 Socket not connected, retrying in 1 second");
          setTimeout(setupSocketListener, 1000);
        }
      } catch (error) {
        console.warn("Error setting up socket listener:", error);
      }
    };

    setupSocketListener();

    return () => {
      try {
        if (socketService.socket) {
          console.log("📋 Cleaning up socket listener");
          socketService.socket.off(
            "assignToEnforcement",
            handleAssignToEnforcement
          );
        }
      } catch (error) {
        console.warn("Error cleaning up socket listener:", error);
      }
    };
  }, []);

  const filteredCases = cases
    .filter((caseItem) => {
      const matchesSearch =
        caseItem.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.violationType
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || caseItem.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" ||
        caseItem.originalReport?.priority === priorityFilter;

      // Handle closed cases
      if (caseItem.status === "Closed" && !showClosedCases) {
        return false;
      }

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date) - new Date(a.date);
        case "riskScore":
          return b.riskScore - a.riskScore;
        case "priority":
          const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          const aPriority =
            priorityOrder[a.originalReport?.priority || "Medium"] || 2;
          const bPriority =
            priorityOrder[b.originalReport?.priority || "Medium"] || 2;
          return bPriority - aPriority;
        default:
          return 0;
      }
    });

  const handleViewDetails = async (caseItem) => {
    try {
      // Try to fetch freshest copy from backend using backendId if available
      let enriched = caseItem;
      const backendId = caseItem.backendId || caseItem.originalReport?._id;
      if (backendId) {
        try {
          const data = await reportService.getReportById(backendId);
          const fresh = data.report || data; // handle both formats
          if (fresh) {
            enriched = {
              ...caseItem,
              photos:
                fresh.media ||
                fresh.photos ||
                fresh.images ||
                caseItem.photos ||
                [],
              originalReport: fresh,
            };
          }
        } catch (fetchErr) {
          console.warn(
            "Failed to fetch report details, using local case data:",
            fetchErr
          );
        }
      }
      setSelectedCase(enriched);
      // Load geometry for this case
      try {
        setGeomLoading(true);
        setGeomError("");
        const reportId = enriched?.originalReport?.reportId || enriched?.id;
        if (reportId) {
          const fc = await reportService.getEncroachmentReportsGeoJSON(
            reportId
          );
          const geom = fc?.features?.[0]?.geometry || null;
          setGeometry(geom);
        } else {
          setGeometry(null);
        }
      } catch (e) {
        setGeomError(e?.message || "Failed to load geometry");
        setGeometry(null);
      } finally {
        setGeomLoading(false);
      }
      // Open Photos tab by default so images are immediately visible
      setActiveTab("photos");
    } catch (err) {
      console.error("Error preparing case details:", err);
      setSelectedCase(caseItem);
      setActiveTab("photos");
    }
  };

  const closeModal = () => {
    setSelectedCase(null);
  };

  // Error handling for component rendering
  try {
    return (
      <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-screen">
        {/* New Assignment Notification */}
        {newAssignmentNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle
                  className="text-blue-600 dark:text-blue-400"
                  size={20}
                />
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    New Case Assigned
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Case {newAssignmentNotification.id} -{" "}
                    {newAssignmentNotification.violationType} at{" "}
                    {newAssignmentNotification.location}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Risk Score: {newAssignmentNotification.riskScore} •
                    Submitted by: {newAssignmentNotification.submittedBy}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewDetails(newAssignmentNotification)}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => setNewAssignmentNotification(null)}
                  className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
              Citizen Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and manage citizen reports and illegal construction cases
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAssignedReports}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center space-x-2 shadow-md"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 shadow-md">
              <Filter size={16} />
              <span>Filters</span>
            </button>
            <button
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center space-x-2 shadow-md"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to clear all closed cases? This action cannot be undone."
                  )
                ) {
                  setCases((prev) => {
                    const activeCases = prev.filter(
                      (caseItem) => caseItem.status !== "Closed"
                    );
                    saveCasesToStorage(activeCases);
                    return activeCases;
                  });
                }
              }}
            >
              <Download size={16} />
              <span>Clear Closed Cases</span>
            </button>
            <button
              onClick={() => {
                if (cases.length === 0) {
                  showFlashMessage("No cases to export", "warning");
                  return;
                }
                const csvData = cases.map((c) => ({
                  "Case ID": c.id,
                  Location: c.location,
                  "Violation Type": c.violationType,
                  Status: c.status,
                  "Submitted By": c.submittedBy,
                  Date: c.date,
                  "Risk Score": c.riskScore,
                }));
                const csv =
                  Object.keys(csvData[0] || {}).join(",") +
                  "\n" +
                  csvData.map((row) => Object.values(row).join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `enforcement-cases-${
                  new Date().toISOString().split("T")[0]
                }.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                showFlashMessage("Cases exported successfully", "success");
              }}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center space-x-2 shadow-md"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </motion.div>

        {/* Workload Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cases.filter((c) => c.status === "Pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cases.filter((c) => c.status === "In Progress").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Verified
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cases.filter((c) => c.status === "Verified").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Cases
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cases.length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search cases by ID, address, or violation type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Verified">Verified</option>
                <option value="Action Taken">Action Taken</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="lg:w-40">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              >
                <option value="All">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="lg:w-40">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              >
                <option value="date">Sort by Date</option>
                <option value="riskScore">Sort by Risk Score</option>
                <option value="priority">Sort by Priority</option>
              </select>
            </div>

            {/* Show Closed Cases Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showClosedCases"
                checked={showClosedCases}
                onChange={(e) => setShowClosedCases(e.target.checked)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <label
                htmlFor="showClosedCases"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Show Closed Cases
              </label>
            </div>
          </div>
        </motion.div>

        {/* Cases Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
            <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">
              Active Cases
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Case ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Violation Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Submitted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No cases assigned yet
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Cases assigned by admin will appear here in real-time.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((caseItem) => (
                    <tr
                      key={caseItem.id}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {caseItem.id}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {caseItem.date}
                        </div>
                        {caseItem.originalReport?.priority && (
                          <div className="mt-1">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                caseItem.originalReport.priority === "Critical"
                                  ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                                  : caseItem.originalReport.priority === "High"
                                  ? "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400"
                                  : caseItem.originalReport.priority ===
                                    "Medium"
                                  ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                                  : "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                              }`}
                            >
                              {caseItem.originalReport.priority}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {caseItem.location}
                          </span>
                          {caseItem.isUrgent && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                              Urgent
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {caseItem.violationType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <User size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {caseItem.submittedBy}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              caseItem.riskScore >= 80
                                ? "bg-red-500"
                                : caseItem.riskScore >= 60
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                          ></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {caseItem.riskScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              statusColors[caseItem.status]
                            }`}
                          >
                            {caseItem.status}
                          </span>
                          {caseItem.actionHistory?.some(
                            (action) =>
                              action.action === "Assigned to Enforcement" &&
                              action.date ===
                                new Date().toISOString().split("T")[0]
                          ) && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                              New Assignment
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(caseItem)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                          >
                            <Eye size={16} className="mr-1" />
                            View Details
                          </button>
                          {caseItem.status === "Pending" && (
                            <button
                              onClick={() => startWorkingOnCase(caseItem.id)}
                              className="inline-flex items-center px-3 py-2 border border-orange-300 text-sm leading-4 font-medium rounded-lg text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                            >
                              <CheckCircle size={16} className="mr-1" />
                              Start
                            </button>
                          )}
                          {!caseItem.isUrgent && (
                            <button
                              onClick={() => markCaseAsUrgent(caseItem.id)}
                              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                              <AlertTriangle size={16} className="mr-1" />
                              Urgent
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Case Details Modal */}
        <AnimatePresence>
          {selectedCase && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                        {selectedCase.id}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedCase.violationType}
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      <X
                        size={24}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    </button>
                  </div>
                </div>

                {/* Modal Tabs */}
                <div className="border-b border-gray-200 dark:border-neutral-800">
                  <nav className="flex space-x-8 px-6">
                    {[
                      "overview",
                      "photos",
                      "ai-analysis",
                      "action-history",
                    ].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                      >
                        {tab
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Case Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Location:
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {selectedCase.location}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Risk Score:
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {selectedCase.riskScore}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Status:
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  statusColors[selectedCase.status]
                                }`}
                              >
                                {selectedCase.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Submitted By:
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {selectedCase.submittedBy}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Date Assigned:
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {selectedCase.actionHistory?.find(
                                  (action) =>
                                    action.action === "Assigned to Enforcement"
                                )?.date || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Priority:
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {selectedCase.originalReport?.priority ? (
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                      selectedCase.originalReport.priority ===
                                      "Critical"
                                        ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                                        : selectedCase.originalReport
                                            .priority === "High"
                                        ? "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400"
                                        : selectedCase.originalReport
                                            .priority === "Medium"
                                        ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                                        : "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                                    }`}
                                  >
                                    {selectedCase.originalReport.priority}
                                  </span>
                                ) : (
                                  "Medium"
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Media Files:
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {resolveCaseMedia(selectedCase).length} files
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Encroachment Area
                          </h3>
                          {geomLoading ? (
                            <div className="w-full h-40 rounded-md grid place-items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-800">
                              Loading map…
                            </div>
                          ) : geometry ? (
                            <MiniMap geometry={geometry} />
                          ) : geomError ? (
                            <div className="text-xs text-red-600 dark:text-red-400">
                              {geomError}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              No polygon submitted for this case
                            </div>
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                            Description
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300">
                            {selectedCase.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "photos" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Photos & Videos
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {resolveCaseMedia(selectedCase).length > 0 ? (
                          resolveCaseMedia(selectedCase).map((media, index) => {
                            const mediaUrl = getMediaUrl(media);
                            const isImageFile =
                              isImage(media.mimeType) ||
                              looksLikeImageByName(
                                media.originalName ||
                                  media.filename ||
                                  media.url
                              );

                            console.log(
                              `Enforcement Portal - Rendering media ${index}:`,
                              {
                                media,
                                mediaUrl,
                                isImageFile,
                                mimeType: media.mimeType,
                              }
                            );

                            return (
                              <div
                                key={index}
                                className="border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden"
                              >
                                {isImageFile && mediaUrl ? (
                                  <div className="space-y-2">
                                    <img
                                      src={mediaUrl}
                                      alt={
                                        media.originalName ||
                                        media.filename ||
                                        `media-${index}`
                                      }
                                      className="w-full h-48 object-cover"
                                      onError={(e) => {
                                        console.error(
                                          `Image failed to load: ${mediaUrl}`,
                                          e
                                        );
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display =
                                          "flex";
                                      }}
                                    />
                                    <div className="hidden flex items-center justify-center h-48 bg-gray-100 dark:bg-neutral-800">
                                      <div className="text-center">
                                        <ImageIcon
                                          size={32}
                                          className="mx-auto text-gray-400 mb-2"
                                        />
                                        <p className="text-sm text-gray-500">
                                          Image not available
                                        </p>
                                      </div>
                                    </div>
                                    <div className="p-2">
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {media.originalName} •{" "}
                                        {(media.size / 1024 / 1024).toFixed(2)}{" "}
                                        MB
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-neutral-800 h-48">
                                    <FileText
                                      size={24}
                                      className="text-gray-400"
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {media.originalName}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {(media.size / 1024 / 1024).toFixed(2)}{" "}
                                        MB • {media.mimeType}
                                      </p>
                                    </div>
                                    {mediaUrl && (
                                      <a
                                        href={mediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90 transition-colors"
                                      >
                                        Download
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                            <ImageIcon
                              size={48}
                              className="mx-auto mb-3 text-gray-300"
                            />
                            <p>No media files attached to this case</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "ai-analysis" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        AI Analysis
                      </h3>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-blue-800 dark:text-blue-200">
                          {selectedCase.aiAnalysis}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "action-history" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Action History
                      </h3>

                      {/* Add Note Section */}
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          Add Note
                        </h4>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Enter your note..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && e.target.value.trim()) {
                                addNoteToCase(
                                  selectedCase.id,
                                  e.target.value.trim()
                                );
                                e.target.value = "";
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.target.previousSibling;
                              if (input.value.trim()) {
                                addNoteToCase(
                                  selectedCase.id,
                                  input.value.trim()
                                );
                                input.value = "";
                              }
                            }}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Action History List */}
                      <div className="space-y-3">
                        {selectedCase.actionHistory.map((action, index) => (
                          <div
                            key={index}
                            className={`flex items-center space-x-3 p-3 rounded-lg ${
                              action.isNote
                                ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                : "bg-gray-50 dark:bg-neutral-800"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                action.isNote ? "bg-blue-500" : "bg-primary"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {action.action}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {action.date} by {action.officer}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800">
                  <div className="flex items-center justify-end space-x-3">
                    {selectedCase.status === "Pending" && (
                      <button
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        onClick={() => {
                          startWorkingOnCase(selectedCase.id);
                          closeModal();
                        }}
                      >
                        Start Working
                      </button>
                    )}
                    {selectedCase.status === "In Progress" && (
                      <button
                        className="px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                        onClick={() => {
                          updateCaseStatus(selectedCase.id, "Verified");
                          closeModal();
                        }}
                      >
                        Mark as Verified
                      </button>
                    )}
                    <button
                      className="px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                      onClick={() => {
                        updateCaseStatus(selectedCase.id, "Action Taken");
                        closeModal();
                      }}
                    >
                      Mark Action Taken
                    </button>
                    <button
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to close case "${selectedCase.id}"? This action cannot be undone.`
                          )
                        ) {
                          removeCase(selectedCase.id);
                          closeModal();
                        }
                      }}
                    >
                      Close Case
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  } catch (error) {
    console.error("Error rendering CaseManagement component:", error);
    return (
      <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-screen">
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
          Error Loading Case Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Failed to load case management data. Please try again later.
        </p>
      </div>
    );
  }
}
