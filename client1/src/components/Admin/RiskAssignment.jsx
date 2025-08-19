import React, { useEffect, useMemo, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion } from "framer-motion";
import { AlertTriangle, Filter, Map as MapIcon, Search } from "lucide-react";
import { getApiBaseUrl } from "../../lib/utils.js";
import { addBoundaryToMap } from "../../lib/boundary";

// Helper: categorize risk similar to your Python logic
function categorize(score) {
  if (score < 35) return "Low";
  if (score < 70) return "Medium";
  return "High";
}

// Mock dataset derived from your Python example
const MOCK_POINTS = (() => {
  const data = [
    ["Vijay Nagar", 68.13],
    ["Rajwada", 100.0],
    ["Bhawarkuan", 49.78],
    ["Palasia", 40.26],
    ["Tilak Nagar", 81.38],
    ["Rau", 55.2],
    ["MG Road", 72.5],
    ["Kanadia Road", 60.0],
    ["Bhanwarkuan Extension", 48.9],
    ["Super Corridor", 90.2],
    ["Banganga", 45.0],
    ["Nanda Nagar", 50.3],
    ["Mhow Naka", 35.5],
    ["Sukhliya", 60.8],
    ["Scheme 54", 53.2],
    ["Chhatribagh", 42.7],
    ["Malwa Mill", 38.6],
    ["Khajrana", 77.5],
    ["Indrapuri", 65.3],
    ["Sudama Nagar", 36.9],
  ];
  const coords = {
    "Vijay Nagar": [75.91, 22.75],
    Rajwada: [75.857, 22.719],
    Bhawarkuan: [75.865, 22.686],
    Palasia: [75.89, 22.73],
    "Tilak Nagar": [75.925, 22.745],
    Rau: [75.805, 22.633],
    "MG Road": [75.87, 22.72],
    "Kanadia Road": [75.95, 22.72],
    "Bhanwarkuan Extension": [75.875, 22.69],
    "Super Corridor": [75.95, 22.78],
    Banganga: [75.87, 22.78],
    "Nanda Nagar": [75.895, 22.765],
    "Mhow Naka": [75.86, 22.69],
    Sukhliya: [75.915, 22.765],
    "Scheme 54": [75.905, 22.74],
    Chhatribagh: [75.85, 22.725],
    "Malwa Mill": [75.875, 22.715],
    Khajrana: [75.92, 22.74],
    Indrapuri: [75.905, 22.755],
    "Sudama Nagar": [75.87, 22.7],
  };
  return data.map(([name, score]) => ({
    id: name.replace(/\s+/g, "-").toLowerCase(),
    area_name: name,
    longitude: coords[name][0],
    latitude: coords[name][1],
    past_challans: 0,
    illegal_construction_cases: 0,
    encroachment_cases: 0,
    population_density: null,
    avg_land_value: null,
    risk_score: score,
    risk_category: categorize(score),
  }));
})();

// Convert rows to GeoJSON FeatureCollection
function toFeatureCollection(rows) {
  const features = (rows || []).map((r) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [Number(r.longitude), Number(r.latitude)],
    },
    properties: {
      id: r.id || r.area_name,
      area_name: r.area_name || "",
      past_challans: r.past_challans ?? null,
      illegal_construction_cases: r.illegal_construction_cases ?? null,
      encroachment_cases: r.encroachment_cases ?? null,
      population_density: r.population_density ?? null,
      avg_land_value: r.avg_land_value ?? null,
      risk_score: Number(r.risk_score),
      risk_category: r.risk_category || categorize(Number(r.risk_score)),
    },
  }));
  return { type: "FeatureCollection", features };
}

export default function RiskAssignment() {
  const API_BASE = getApiBaseUrl();
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const hasFitRef = useRef(false);
  const pendingFitRef = useRef(false);
  const resizeObserverRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [mapError, setMapError] = useState("");
  const [rows, setRows] = useState([]);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Filters
  const [category, setCategory] = useState("");
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [scoreMax, setScoreMax] = useState(100);
  const [search, setSearch] = useState("");

  // Normalize text for robust searching
  function normalizeText(value) {
    try {
      return String(value || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    } catch {
      return String(value || "")
        .toLowerCase()
        .trim();
    }
  }

  // Load data preferring the public mock first, then API, then inline fallback.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        // 1) Public mock via backend converter (preferred for many points)
        const resMock = await fetch(`${API_BASE}/risk-data/mock`);
        const jsonMock = await resMock.json().catch(() => ({}));
        const mock =
          resMock.ok && Array.isArray(jsonMock?.data) ? jsonMock.data : [];
        if (mock.length > 0) {
          if (!cancelled) setRows(mock);
        } else {
          // 2) PostGIS-backed API (or built-in small mock)
          const res = await fetch(`${API_BASE}/risk-data`);
          const json = await res.json().catch(() => ({}));
          const primary =
            res.ok && json && Array.isArray(json.data) ? json.data : [];
          if (primary.length > 0) {
            if (!cancelled) setRows(primary);
          } else if (!cancelled) {
            // 3) Inline fallback
            setRows(MOCK_POINTS);
          }
        }
      } catch (_e) {
        if (!cancelled) {
          setRows(MOCK_POINTS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  // Establish dynamic score max and initialize range when rows arrive
  const initializedRangeRef = useRef(false);
  useEffect(() => {
    if (!rows || rows.length === 0) return;
    const maxScore = rows.reduce((m, r) => {
      const s = Number(r.risk_score);
      return Number.isFinite(s) ? Math.max(m, s) : m;
    }, 0);
    const newMax = Math.max(100, Math.ceil(maxScore));
    setScoreMax(newMax);
    if (!initializedRangeRef.current) {
      initializedRangeRef.current = true;
      setScoreRange([0, newMax]);
    }
  }, [rows]);

  const filteredRows = useMemo(() => {
    const tokens = normalizeText(search).split(" ").filter(Boolean);
    return (rows || []).filter((r) => {
      const score = Number(r.risk_score);
      const cat = (r.risk_category || categorize(score) || "").toLowerCase();
      const okCategory = !category || cat === category.toLowerCase();
      const okScore =
        Number.isFinite(score) &&
        score >= scoreRange[0] &&
        score <= scoreRange[1];
      const areaNorm = normalizeText(r.area_name);
      const okSearch =
        tokens.length === 0 || tokens.every((t) => areaNorm.includes(t));
      return okCategory && okScore && okSearch;
    });
  }, [rows, category, scoreRange, search]);

  // Initialize mapbox map
  useEffect(() => {
    if (!token) return;
    if (mapRef.current || !mapContainerRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [75.8577, 22.7196],
      zoom: 11,
    });
    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );

    map.on("error", (e) => {
      const msg = e?.error?.message || e?.message || "Map error";
      setMapError(String(msg));
    });

    map.on("load", async () => {
      // Sources for points (clustered and raw for heatmap)
      if (!map.getSource("risk-points")) {
        map.addSource("risk-points", {
          type: "geojson",
          data: toFeatureCollection(filteredRows),
          cluster: true,
          clusterRadius: 40,
          clusterMaxZoom: 14,
        });
      }
      if (!map.getSource("risk-points-raw")) {
        map.addSource("risk-points-raw", {
          type: "geojson",
          data: toFeatureCollection(filteredRows),
        });
      }

      // Add Indore boundary (same as dashboard)
      try {
        await addBoundaryToMap(map, { zoomThreshold: 13 });
      } catch (e) {
        console.warn("Failed to add boundary:", e?.message || e);
      }

      // Heatmap layer (uses same source)
      if (!map.getLayer("risk-heat")) {
        map.addLayer({
          id: "risk-heat",
          type: "heatmap",
          source: "risk-points-raw",
          maxzoom: 15,
          paint: {
            // Weight by normalized risk_score
            "heatmap-weight": [
              "interpolate",
              ["linear"],
              ["to-number", ["get", "risk_score"]],
              0,
              0,
              100,
              1,
            ],
            "heatmap-intensity": 1.2,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(34,197,94,0)",
              0.2,
              "rgba(34,197,94,0.5)",
              0.4,
              "rgba(245,158,11,0.6)",
              0.8,
              "rgba(239,68,68,0.8)",
            ],
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              20,
              15,
              35,
            ],
            "heatmap-opacity": 0.75,
          },
        });
      }

      // Cluster circles
      if (!map.getLayer("risk-clusters")) {
        map.addLayer({
          id: "risk-clusters",
          type: "circle",
          source: "risk-points",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#2563eb",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              14,
              10,
              18,
              25,
              24,
            ],
            "circle-opacity": 0.85,
          },
        });
      }

      // Cluster count labels
      if (!map.getLayer("risk-cluster-count")) {
        map.addLayer({
          id: "risk-cluster-count",
          type: "symbol",
          source: "risk-points",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#ffffff",
          },
        });
      }

      // Unclustered points colored by risk_category
      if (!map.getLayer("risk-unclustered")) {
        map.addLayer({
          id: "risk-unclustered",
          type: "circle",
          source: "risk-points",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-radius": 6,
            "circle-stroke-width": 2,
            "circle-stroke-color": [
              "match",
              ["get", "risk_category"],
              "High",
              "#ef4444",
              "Medium",
              "#f59e0b",
              "Low",
              "#22c55e",
              "#888888",
            ],
            "circle-color": [
              "match",
              ["get", "risk_category"],
              "High",
              "#ef4444",
              "Medium",
              "#f59e0b",
              "Low",
              "#22c55e",
              "#888888",
            ],
            "circle-opacity": 0.8,
          },
        });
      }

      // Ensure sources have current data and fit to bounds once
      const src = map.getSource("risk-points");
      const srcRaw = map.getSource("risk-points-raw");
      if (src && src.setData) {
        try {
          src.setData(toFeatureCollection(filteredRows));
        } catch {}
      }
      if (srcRaw && srcRaw.setData) {
        try {
          srcRaw.setData(toFeatureCollection(filteredRows));
        } catch {}
      }

      if (
        (!hasFitRef.current && filteredRows.length > 0) ||
        pendingFitRef.current
      ) {
        try {
          const bounds = new mapboxgl.LngLatBounds();
          filteredRows.forEach((r) =>
            bounds.extend([Number(r.longitude), Number(r.latitude)])
          );
          if (!bounds.isEmpty()) {
            map.fitBounds(bounds, { padding: 40, maxZoom: 13 });
            hasFitRef.current = true;
            pendingFitRef.current = false;
          }
        } catch {}
      }

      // Trigger resize shortly after load to account for animated layout
      setTimeout(() => {
        try {
          map.resize();
        } catch {}
      }, 200);

      // Popup on click
      map.on("click", "risk-unclustered", (e) => {
        const f = e.features && e.features[0];
        if (!f) return;
        const p = f.properties || {};
        const html = `
          <div class="space-y-1">
            <div class="font-semibold text-gray-900">${
              p.area_name || "Unknown"
            }</div>
            <div class="text-sm">Risk: <b>${
              p.risk_category
            }</b> (Score: ${Number(p.risk_score).toFixed(1)})</div>
            <div class="text-xs text-gray-700">
              Challans: ${p.past_challans ?? "-"}<br/>
              Illegal Construction: ${p.illegal_construction_cases ?? "-"}<br/>
              Encroachments: ${p.encroachment_cases ?? "-"}<br/>
              Population Density: ${p.population_density ?? "-"}<br/>
              Avg Land Value: ${p.avg_land_value ?? "-"}
            </div>
          </div>`;
        new mapboxgl.Popup({ offset: 16 })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
      });

      // Zoom into cluster on click
      map.on("click", "risk-clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["risk-clusters"],
        });
        const clusterId = features[0].properties.cluster_id;
        const source = map.getSource("risk-points");
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({ center: features[0].geometry.coordinates, zoom });
        });
      });

      map.on(
        "mouseenter",
        "risk-unclustered",
        () => (map.getCanvas().style.cursor = "pointer")
      );
      map.on(
        "mouseleave",
        "risk-unclustered",
        () => (map.getCanvas().style.cursor = "")
      );
      map.on(
        "mouseenter",
        "risk-clusters",
        () => (map.getCanvas().style.cursor = "pointer")
      );
      map.on(
        "mouseleave",
        "risk-clusters",
        () => (map.getCanvas().style.cursor = "")
      );
    });

    const handleResize = () => {
      try {
        map.resize();
      } catch {}
    };
    window.addEventListener("resize", handleResize);
    // Observe container size changes
    try {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const cr = entry.contentRect;
          setContainerSize({
            w: Math.round(cr.width),
            h: Math.round(cr.height),
          });
          try {
            map.resize();
          } catch {}
        }
      });
      resizeObserverRef.current.observe(mapContainerRef.current);
    } catch {}

    return () => {
      map.remove();
      mapRef.current = null;
      window.removeEventListener("resize", handleResize);
      try {
        resizeObserverRef.current && resizeObserverRef.current.disconnect();
      } catch {}
    };
  }, [token]);

  // Update source data whenever filters/results change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("risk-points");
    const srcRaw = map.getSource("risk-points-raw");
    if (src && src.setData) {
      src.setData(toFeatureCollection(filteredRows));
    }
    if (srcRaw && srcRaw.setData) {
      srcRaw.setData(toFeatureCollection(filteredRows));
    }

    // Fit to bounds on filter change if we haven't fit yet and points exist
    const hasActiveFilter =
      Boolean(category) ||
      normalizeText(search).length > 0 ||
      scoreRange[0] > 0 ||
      scoreRange[1] < scoreMax;
    if (filteredRows.length > 0) {
      try {
        const bounds = new mapboxgl.LngLatBounds();
        filteredRows.forEach((r) =>
          bounds.extend([Number(r.longitude), Number(r.latitude)])
        );
        if (!bounds.isEmpty()) {
          if (hasActiveFilter || !hasFitRef.current) {
            map.fitBounds(bounds, { padding: 40, maxZoom: 13 });
            if (!hasActiveFilter) hasFitRef.current = true;
          }
        }
      } catch {}
    }
  }, [filteredRows]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle size={22} className="text-red-500" /> Risk Assessment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Visualize and filter risk across areas
          </p>
        </div>
      </motion.div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Risk Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 dark:border-neutral-700 rounded-md p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
            >
              <option value="">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="min-w-[220px]">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Risk Score Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={scoreRange[0]}
                min={0}
                max={scoreMax}
                onChange={(e) =>
                  setScoreRange([Number(e.target.value) || 0, scoreRange[1]])
                }
                className="w-20 border border-gray-300 dark:border-neutral-700 rounded-md p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={scoreRange[1]}
                min={0}
                max={scoreMax}
                onChange={(e) =>
                  setScoreRange([scoreRange[0], Number(e.target.value) || 0])
                }
                className="w-20 border border-gray-300 dark:border-neutral-700 rounded-md p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Search Area
            </label>
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type area name..."
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-md p-2 pl-9 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              />
              <Search
                size={16}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <button
            onClick={() => {
              setCategory("");
              setScoreRange([0, 100]);
              setSearch("");
            }}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2"
          >
            <Filter size={16} /> Reset Filters
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-heading font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapIcon size={18} /> Risk Assignment Map
            </h2>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {filteredRows.length} result(s)
            </div>
          </div>

          <div className="relative h-[560px] rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-800">
            {!token ? (
              <div className="absolute inset-0 grid place-items-center text-gray-600 dark:text-gray-300 text-sm">
                Set VITE_MAPBOX_TOKEN in client1/.env to view the map.
              </div>
            ) : (
              <>
                <div ref={mapContainerRef} className="w-full h-full" />
                {loading && (
                  <div className="absolute inset-0 grid place-items-center text-gray-600 dark:text-gray-300 text-sm">
                    Loading map data...
                  </div>
                )}
                {mapError && (
                  <div className="absolute inset-0 grid place-items-center text-red-600 text-sm px-4 text-center">
                    {mapError}
                  </div>
                )}
                {!mapError && containerSize.h === 0 && (
                  <div className="absolute inset-0 grid place-items-center text-gray-600 dark:text-gray-300 text-sm px-4 text-center">
                    Map container has zero height. If this page animates in, try
                    switching tabs once or resize the window.
                  </div>
                )}
              </>
            )}
            {/* Legend */}
            <div className="absolute left-4 bottom-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-lg shadow border border-gray-200 dark:border-neutral-700 p-3 text-xs">
              <div className="font-semibold mb-1 text-gray-900 dark:text-white">
                Risk Level Legend
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ background: "#22c55e" }}
                ></span>
                <span className="text-gray-700 dark:text-gray-300">
                  Low Risk
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ background: "#f59e0b" }}
                ></span>
                <span className="text-gray-700 dark:text-gray-300">
                  Medium Risk
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ background: "#ef4444" }}
                ></span>
                <span className="text-gray-700 dark:text-gray-300">
                  High Risk
                </span>
              </div>
              <div className="mt-2 text-gray-600 dark:text-gray-400">
                Heatmap: green → orange → red
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
