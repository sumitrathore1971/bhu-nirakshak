import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  MapPin,
  User,
  Calendar,
  FileText,
  Volume2,
  VolumeX,
} from "lucide-react";
import socketService from "../../services/socketService.js";
import { useAuth } from "../../context/AuthContext.jsx";

// Global event system for notifications
const notificationEvents = {
  listeners: new Set(),
  emit(data) {
    this.listeners.forEach((listener) => listener(data));
  },
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
};

// Export for other components to use
export { notificationEvents };

export default function NotificationPanel() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef(null);

  // Notification sound (optional)
  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.log("Could not play notification sound:", err);
      });
    }
  };

  // Handle new report notifications
  const handleNewReport = (data) => {
    console.log("🔔 Received new report notification:", data);
    console.log("🔔 Current notifications count:", notifications.length);
    console.log("🔔 Current unread count:", unreadCount);

    const newNotification = {
      id: Date.now(),
      type: "newReport",
      title: "New Report Submitted",
      message: `Report "${data.report.title}" submitted by ${data.report.reporter.fullName}`,
      report: data.report,
      timestamp: data.timestamp,
      isRead: false,
      priority: "high",
    };

    console.log("🔔 Creating notification:", newNotification);

    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      console.log(
        "🔔 Updated notifications array:",
        updated.length,
        "notifications"
      );
      return updated;
    });

    setUnreadCount((prev) => {
      const updated = prev + 1;
      console.log("🔔 Updated unread count:", updated);
      return updated;
    });

    playNotificationSound();

    // Emit to global event system for other components
    notificationEvents.emit(data);

    // Auto-remove notification after 30 seconds
    setTimeout(() => {
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.id !== newNotification.id);
        console.log(
          "🔔 Auto-removed notification, remaining:",
          filtered.length
        );
        return filtered;
      });
    }, 30000);
  };

  // Handle case assignment notifications
  const handleAssignToEnforcement = (data) => {
    console.log("🔔 Received assignToEnforcement event:", data);
    console.log("🔔 Current user role:", user?.role);
    console.log(
      "🔔 Socket connection status:",
      socketService.getConnectionStatus()
    );
    if (!data || !data.report) {
      console.log("🔔 Invalid data received:", data);
      return;
    }
    console.log("🔔 Creating notification for case assignment");
    const newNotification = {
      id: Date.now(),
      type: "assignToEnforcement",
      title: "Case Assigned by Admin",
      message: `Case "${
        data.report.title || data.report.reportId || data.report.id
      }" assigned to enforcement by Admin`,
      report: data.report,
      timestamp: data.timestamp,
      isRead: false,
      priority: "high",
    };
    console.log("🔔 Adding notification to state:", newNotification);
    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      console.log(
        "🔔 Updated notifications array:",
        updated.length,
        "notifications"
      );
      return updated;
    });
    setUnreadCount((prev) => {
      const updated = prev + 1;
      console.log("🔔 Updated unread count:", updated);
      return updated;
    });
    playNotificationSound();
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // Remove notification
  const removeNotification = (notificationId) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return prev.filter((n) => n.id !== notificationId);
    });
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get location display
  const getLocationDisplay = (report) => {
    if (report.location?.address) {
      return report.location.address;
    } else if (report.location?.area) {
      return report.location.area;
    } else if (report.location?.coordinates?.coordinates) {
      const [lng, lat] = report.location.coordinates.coordinates;
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    return "Location not specified";
  };

  // Setup socket connection and listeners
  useEffect(() => {
    console.log("🔔 NotificationPanel useEffect triggered");
    console.log("🔔 User object:", user);
    console.log("🔔 User ID:", user?.id);
    console.log("🔔 User role:", user?.role);
    console.log("🔔 Is authenticated:", !!user);

    if (!user || !user.id) {
      console.log("🔔 No user or user ID found, skipping socket connection");
      console.log("🔔 User object details:", {
        user: user,
        hasUser: !!user,
        userId: user?.id,
        userRole: user?.role,
        userName: user?.name,
      });
      return;
    }

    console.log("🔔 Setting up socket connection for user:", user.role);
    console.log("🔔 User details:", {
      id: user.id,
      role: user.role,
      name: user.name,
    });

    // Connect to socket service
    socketService.connect();

    // Check connection status
    const status = socketService.getConnectionStatus();
    console.log("🔔 Socket connection status:", status);

    // Join appropriate room based on user role
    if (user.role === "Admin") {
      console.log("🔔 Joining admin room");
      // Add a small delay to ensure connection is established
      setTimeout(() => {
        socketService.joinAdminRoom();
      }, 100);
    } else if (user.role === "Enforcement") {
      console.log("🔔 Joining enforcement room");
      // Add a small delay to ensure connection is established
      setTimeout(() => {
        socketService.joinEnforcementRoom();
      }, 100);
    }

    // Listen for new reports
    console.log("🔔 Setting up new report listener");
    socketService.onNewReport(handleNewReport);

    // Listen for case assignments
    if (user.role === "Enforcement") {
      console.log("🔔 Setting up assignToEnforcement listener for Enforcement");
      console.log("🔔 Socket object:", socketService.socket);
      console.log("🔔 Socket connected:", socketService.socket?.connected);
      if (socketService.socket && socketService.socket.connected) {
        socketService.socket.on(
          "assignToEnforcement",
          handleAssignToEnforcement
        );
        console.log("🔔 assignToEnforcement listener set up successfully");
      } else {
        console.log("🔔 Socket not connected, will retry when connected");
        // Retry when socket connects
        const checkConnection = () => {
          if (socketService.socket && socketService.socket.connected) {
            console.log(
              "🔔 Socket now connected, setting up assignToEnforcement listener"
            );
            socketService.socket.on(
              "assignToEnforcement",
              handleAssignToEnforcement
            );
          } else {
            setTimeout(checkConnection, 1000);
          }
        };
        checkConnection();
      }
    }

    // Cleanup on unmount
    return () => {
      console.log("🔔 Cleaning up socket connection");
      socketService.offNewReport(handleNewReport);
      if (user.role === "Enforcement" && socketService.socket) {
        socketService.socket.off(
          "assignToEnforcement",
          handleAssignToEnforcement
        );
      }
      // Don't call cleanup() here as it affects other components
      // socketService.cleanup();
    };
  }, [user?.id, user?.role]); // Depend on user.id and user.role

  // Remove the second useEffect that was calling cleanup
  // useEffect(() => {
  //   return () => {
  //     socketService.cleanup();
  //   };
  // }, []);

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-96 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-gray-200 dark:border-neutral-700 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title={soundEnabled ? "Disable sound" : "Enable sound"}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Controls */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between text-sm">
                <button
                  onClick={markAllAsRead}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Mark all as read
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-sm">New reports will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors ${
                        !notification.isRead
                          ? "bg-blue-50 dark:bg-blue-900/10"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {notification.message}
                          </p>

                          {notification.report && (
                            <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
                              <div className="flex items-center gap-1">
                                <User size={12} />
                                <span>
                                  {notification.report.reporter.fullName}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={12} />
                                <span>
                                  {getLocationDisplay(notification.report)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText size={12} />
                                <span>{notification.report.category}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors ml-2"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}
