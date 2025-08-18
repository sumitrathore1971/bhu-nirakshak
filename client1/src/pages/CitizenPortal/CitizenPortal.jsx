import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import CitizenLayout from "@/components/Citizen/CitizenLayout";
import ReportForm from "@/components/Citizen/ReportForm";
import MapSelector from "@/components/Citizen/MapSelector";
import reportService from "@/services/reportService.js";
import MyReports from "@/components/Citizen/MyReports";
import HelpGuidelines from "@/components/Citizen/HelpGuidelines";
import Profile from "@/components/Citizen/Profile";
import TrackCase from "@/components/Citizen/TrackCase";
// Removed standalone encroachment reports view

function ConfirmationModal({ open, onClose, caseId }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center">
        <div className="mx-auto mb-3 size-14 rounded-full grid place-items-center bg-green-100 text-green-600 text-2xl">
          ✓
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          Report Submitted
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Your case has been recorded successfully.
        </p>
        <p className="mt-1 text-sm font-medium text-gray-800">
          Case ID: <span className="font-bold">{caseId}</span>
        </p>
        <div className="mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CitizenPortal() {
  const [activePage, setActivePage] = useState("report");
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [polygon, setPolygon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [caseId, setCaseId] = useState("");
  const location_path = useLocation();

  // Update active page based on current route
  useEffect(() => {
    const path = location_path.pathname;
    if (path.includes("/report")) setActivePage("report");
    else if (path.includes("/my-reports")) setActivePage("my-reports");
    // removed view-encroachments route
    else if (path.includes("/track")) setActivePage("track");
    else if (path.includes("/help")) setActivePage("help");
    else if (path.includes("/profile")) setActivePage("profile");
    else setActivePage("report");
  }, [location_path]);

  async function handleSubmit(payload) {
    // payload is the report object returned from backend via ReportForm on success
    setSubmitting(true);
    try {
      const id = payload?.reportId || payload?.id || payload?._id || "";
      setCaseId(id);
      setShowConfirm(true);
      setLocation({ lat: null, lng: null });
      // If a polygon was drawn, submit it to geospatial reports API
      if (polygon && polygon.type === "Polygon") {
        try {
          await reportService.submitEncroachmentGeometry(
            polygon,
            "Citizen Report",
            id
          );
        } catch (e) {
          console.warn(
            "Failed to submit encroachment geometry:",
            e?.message || e
          );
        }
      }
      setPolygon(null);
    } finally {
      setSubmitting(false);
    }
  }

  const renderContent = () => {
    switch (activePage) {
      case "report":
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Report Land Encroachment
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Help Indore stay safe and planned. Provide details and location
                to alert the authorities.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4 md:p-6"
              >
                <ReportForm
                  onSubmit={handleSubmit}
                  location={location}
                  setLocation={setLocation}
                />
                {submitting && (
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Submitting...
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-2 md:p-3 h-full min-h-[480px]"
              >
                <MapSelector
                  value={location}
                  onChange={setLocation}
                  onPolygonChange={setPolygon}
                />
                <div className="px-2 py-2 text-xs text-slate-600 dark:text-slate-400">
                  Tip: Use the polygon tool to draw the encroachment area.
                </div>
              </motion.div>
            </div>
          </div>
        );
      case "my-reports":
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                My Reports
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Track your submitted cases and their current status.
              </p>
            </motion.div>
            <MyReports />
          </div>
        );
      case "track":
        return <TrackCase />;
      case "help":
        return <HelpGuidelines />;
      case "profile":
        return <Profile />;
      // removed view-encroachments branch
      default:
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Report Land Encroachment
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Help Indore stay safe and planned. Provide details and location
                to alert the authorities.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4 md:p-6"
              >
                <ReportForm
                  onSubmit={handleSubmit}
                  location={location}
                  setLocation={setLocation}
                />
                {submitting && (
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Submitting...
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-2 md:p-3 h-full min-h-[480px]"
              >
                <MapSelector value={location} onChange={setLocation} />
                <div className="px-2 py-2 text-xs text-slate-600 dark:text-slate-400">
                  Tip: Use the polygon tool to draw the encroachment area.
                </div>
              </motion.div>
            </div>
          </div>
        );
    }
  };

  return (
    <CitizenLayout activePage={activePage} setActivePage={setActivePage}>
      {renderContent()}
      <ConfirmationModal
        open={showConfirm}
        caseId={caseId}
        onClose={() => setShowConfirm(false)}
      />
    </CitizenLayout>
  );
}
