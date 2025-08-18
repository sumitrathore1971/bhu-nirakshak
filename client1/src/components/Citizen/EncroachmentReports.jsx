import React, { useEffect, useMemo, useRef, useState } from "react";
import reportService from "@/services/reportService.js";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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

  return (
    <div
      ref={containerRef}
      className="w-full h-40 rounded-md overflow-hidden border border-gray-200 dark:border-neutral-800"
    />
  );
}

function sourceColor(source) {
  switch ((source || "").toLowerCase()) {
    case "drone":
      return "#ef4444"; // red
    case "satellite":
      return "#22c55e"; // green
    default:
      return "#3b82f6"; // blue for Citizen Report
  }
}

export default function EncroachmentReports() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const fc = await reportService.getEncroachmentReportsGeoJSON();
        const list = Array.isArray(fc?.features) ? fc.features : [];
        setFeatures(list);
      } catch (e) {
        setError(e?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Encroachment Reports
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Community and automated detections submitted on the map.
        </p>
      </div>

      {loading && (
        <div className="text-gray-600 dark:text-gray-400">Loading…</div>
      )}
      {error && <div className="text-red-600 dark:text-red-400">{error}</div>}

      <div className="space-y-4">
        {features.length === 0 && !loading ? (
          <div className="text-gray-600 dark:text-gray-400">
            No reports yet.
          </div>
        ) : (
          features.map((f, idx) => {
            const id = f?.properties?.id ?? idx + 1;
            const source = f?.properties?.source || "Citizen Report";
            const detected = f?.properties?.detected_on
              ? new Date(f.properties.detected_on).toLocaleString()
              : "";
            const color = sourceColor(source);
            return (
              <div
                key={`${id}-${idx}`}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-4"
              >
                <div className="md:col-span-2">
                  <MiniMap geometry={f.geometry} color={color} />
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      ID:
                    </span>{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {id}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Source:
                    </span>{" "}
                    <span className="font-medium" style={{ color }}>
                      {source}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Detected on:
                    </span>{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {detected}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
