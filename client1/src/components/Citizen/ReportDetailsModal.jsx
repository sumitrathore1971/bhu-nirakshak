import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion } from "framer-motion";
import { X, Image as ImageIcon, FileText, Clock, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { getStaticBaseUrl } from "../../lib/utils.js";
import reportService from "../../services/reportService.js";

export default function ReportDetailsModal({ open, onClose, report }) {
  if (!open || !report) return null;

  // Debug logging
  console.log('ReportDetailsModal - Report data:', report);
  console.log('ReportDetailsModal - Media array:', report.media);

  // Helpers to extract coordinates
  const getLongitude = (rep) => {
    try {
      const coords = rep?.location?.coordinates?.coordinates;
      if (Array.isArray(coords) && coords.length === 2) return coords[0];
      return null;
    } catch {
      return null;
    }
  };

  const getLatitude = (rep) => {
    try {
      const coords = rep?.location?.coordinates?.coordinates;
      if (Array.isArray(coords) && coords.length === 2) return coords[1];
      return null;
    } catch {
      return null;
    }
  };

  // Function to check if a file is an image
  const isImage = (mimeType) => {
    return mimeType && mimeType.startsWith("image/");
  };

  // Function to get the full URL for media files
  const getMediaUrl = (mediaItem) => {
    console.log("getMediaUrl - mediaItem:", mediaItem);

    if (mediaItem.url) {
      // If it's already a full URL, use it as is
      if (
        mediaItem.url.startsWith("http://") ||
        mediaItem.url.startsWith("https://")
      ) {
        console.log("getMediaUrl - Full URL detected:", mediaItem.url);
        return mediaItem.url;
      }
      // If it's a relative path, construct the full URL
      if (mediaItem.url.startsWith("/uploads/")) {
        const baseUrl = getStaticBaseUrl();
        const fullUrl = `${baseUrl}${mediaItem.url}`;
        console.log(
          "getMediaUrl - Constructed URL from relative path:",
          fullUrl
        );
        return fullUrl;
      }
      // If it's just a filename, construct the uploads URL
      const baseUrl = getStaticBaseUrl();
      const fullUrl = `${baseUrl}/uploads/${mediaItem.filename}`;
      console.log("getMediaUrl - Constructed URL from filename:", fullUrl);
      return fullUrl;
    }
    console.log("getMediaUrl - No URL found, returning null");
    return null;
  };

  // Escalation Matrix configuration with defined timelines
  const ESCALATION_STAGES = [
    { key: "Reported", timelineText: "Immediate acknowledgement", add: { hours: 0 } },
    { key: "Verified", timelineText: "Within 48 hours", add: { hours: 48 } },
    { key: "Assigned to Enforcement", timelineText: "Within 72 hours after verification", add: { hours: 72 } },
    { key: "Action Taken", timelineText: "Within 7 days after assignment", add: { days: 7 } },
    { key: "Closed", timelineText: "Within 2 days after action", add: { days: 2 } },
  ];

  const getCurrentStageIndex = (status) => {
    const index = ESCALATION_STAGES.findIndex((s) => s.key === status);
    return index === -1 ? 0 : index;
  };

  const addDuration = (date, add) => {
    if (!date) return null;
    const d = new Date(date);
    if (Number.isFinite(add?.hours)) d.setHours(d.getHours() + add.hours);
    if (Number.isFinite(add?.days)) d.setDate(d.getDate() + add.days);
    return d;
  };

  const formatExpected = (date) =>
    new Date(date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

  // Build cumulative expected-by dates for each stage based on createdAt
  const expectedByDates = (() => {
    const base = report?.createdAt ? new Date(report.createdAt) : null;
    if (!base) return [];
    const arr = [];
    let cursor = new Date(base);
    for (const stage of ESCALATION_STAGES) {
      cursor = addDuration(cursor, stage.add) || cursor;
      arr.push(new Date(cursor));
    }
    return arr;
  })();

  // Actual dates coming from real data
  const ACTUAL_STAGE_DATES = {
    Reported: report?.createdAt || null,
    Verified: report?.verifiedAt || null,
    "Assigned to Enforcement": report?.assignedAt || null,
    "Action Taken": report?.actionTakenAt || null,
    Closed: report?.closedAt || null,
  };

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

  const [geometry, setGeometry] = useState(null);
  const [geomError, setGeomError] = useState("");
  const [geomLoading, setGeomLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadGeometry() {
      try {
        setGeomLoading(true);
        setGeomError("");
        const fc = await reportService.getEncroachmentReportsGeoJSON(
          report.reportId
        );
        const geom = fc?.features?.[0]?.geometry || null;
        if (active) setGeometry(geom);
      } catch (e) {
        if (active) setGeomError(e?.message || "Failed to load geometry");
      } finally {
        if (active) setGeomLoading(false);
      }
    }
    if (open && report?.reportId) {
      loadGeometry();
    } else {
      setGeometry(null);
    }
    return () => {
      active = false;
    };
  }, [open, report?.reportId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">
              {report.reportId}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{report.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Report Details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Report Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Category
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Status
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Date Observed
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(report.dateOfObservation).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Submitted
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                      {report?.location?.address || report?.formattedAddress || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Area</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                      {report?.location?.area || '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Description
                </p>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
                  {report.description}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Location</p>
                <div className="text-sm text-gray-900 dark:text-white">
                  {Number.isFinite(getLongitude(report)) && Number.isFinite(getLatitude(report)) ? (
                    <>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Lng: {getLongitude(report)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Lat: {getLatitude(report)}</p>
                    </>
                  ) : (
                    <p>—</p>
                  )}
                </div>
              </div>

              {/* Polygon Mini Map */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Encroachment Area
                </p>
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
                    No polygon submitted for this report
                  </div>
                )}
              </div>

              {/* Escalation Matrix & Timelines */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Escalation Matrix & Timelines</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  These are standard SLAs for each stage of complaint resolution. Actual timelines may vary based on case complexity.
                </p>
                <div className="space-y-3">
                  {ESCALATION_STAGES.map((stage, idx) => {
                    const currentIdx = getCurrentStageIndex(report.status);
                    const actual = ACTUAL_STAGE_DATES[stage.key];
                    const isCompleted = idx < currentIdx || Boolean(actual);
                    const isCurrent = idx === currentIdx;
                    const Icon = isCompleted ? CheckCircle2 : isCurrent ? Clock : Circle;
                    const iconColor = isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : isCurrent
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400";
                    const expected = expectedByDates[idx];
                    return (
                      <div key={stage.key} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900">
                        <Icon size={18} className={iconColor} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{stage.key}</p>
                            {actual ? (
                              <span className="text-xs text-green-700 dark:text-green-400">
                                Actual: {formatExpected(actual)}
                              </span>
                            ) : expected ? (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Expected by: {formatExpected(expected)}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stage.timelineText}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {(() => {
                  const currentIdx = getCurrentStageIndex(report.status);
                  const now = new Date();
                  const hasActualForCurrent = ACTUAL_STAGE_DATES[ESCALATION_STAGES[currentIdx]?.key];
                  const expectedForCurrent = expectedByDates[currentIdx];
                  const delayed = !hasActualForCurrent && expectedForCurrent && now > expectedForCurrent;
                  if (!delayed) return null;
                  return (
                    <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                      <AlertTriangle size={14} className="mt-0.5" />
                      <span>Current stage appears past the standard SLA. This may be due to operational constraints.</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Media Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Media Files
              </h4>

              {report.media && report.media.length > 0 ? (
                <div className="space-y-3">
                  {report.media.map((media, index) => {
                    const mediaUrl = getMediaUrl(media);
                    const isImageFile = isImage(media.mimeType);

                    console.log(`Media ${index}:`, {
                      media,
                      mediaUrl,
                      isImageFile,
                      mimeType: media.mimeType,
                    });

                    return (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-neutral-700 rounded-lg p-3"
                      >
                        {isImageFile && mediaUrl ? (
                          <div className="space-y-2">
                            <img
                              src={mediaUrl}
                              alt={media.originalName}
                              className="w-full h-48 object-cover rounded-lg"
                              onLoad={() =>
                                console.log(
                                  `Image loaded successfully: ${mediaUrl}`
                                )
                              }
                              onError={(e) => {
                                console.error(
                                  `Image failed to load: ${mediaUrl}`,
                                  e
                                );
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                            <div className="hidden flex items-center justify-center h-48 bg-gray-100 dark:bg-neutral-800 rounded-lg">
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
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {media.originalName} •{" "}
                              {(media.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                            <FileText size={24} className="text-gray-400" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {media.originalName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {(media.size / 1024 / 1024).toFixed(2)} MB •{" "}
                                {media.mimeType}
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
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ImageIcon size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No media files attached to this report</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
