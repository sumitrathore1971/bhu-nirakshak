import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import mapboxgl from "mapbox-gl";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  ClipboardList,
  Filter,
  Calendar,
  MapPin,
} from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

const mockCases = [
  {
    id: "CASE-101",
    location: [22.7196, 75.8577],
    area: "Rajwada",
    category: "Unauthorized Construction",
    status: "Pending",
    submittedBy: "Citizen",
    date: "2024-01-18",
    risk: 82,
  },
  {
    id: "CASE-102",
    location: [22.7339, 75.8839],
    area: "Palasia",
    category: "Building Plan Violation",
    status: "Verified",
    submittedBy: "Drone",
    date: "2024-01-17",
    risk: 74,
  },
  {
    id: "CASE-103",
    location: [22.751, 75.8937],
    area: "Vijay Nagar",
    category: "Illegal Extension",
    status: "Action Taken",
    submittedBy: "Worker",
    date: "2024-01-16",
    risk: 65,
  },
  {
    id: "CASE-104",
    location: [22.678, 75.857],
    area: "Rajendra Nagar",
    category: "Boundary Violation",
    status: "Closed",
    submittedBy: "Citizen",
    date: "2024-01-15",
    risk: 55,
  },
];

const kpis = {
  totalReports: 324,
  verifiedCases: 167,
  actionsTaken: 112,
  closedCases: 78,
  pendingCases: 89,
};

export default function AdminDashboardHome() {
  const [mapLayers, setMapLayers] = useState({
    satellite: false,
    cadastral: false,
    drone: false,
  });
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const caseMarkersRef = useRef([]);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const defaultCenter = { lat: 22.7196, lng: 75.8577 };

  function createCircleGeoJSON(centerLng, centerLat, radiusMeters, steps = 64) {
    const coordinates = [];
    const earthRadius = 6378137;
    const angularDistance = radiusMeters / earthRadius;
    const centerLatRad = (centerLat * Math.PI) / 180;
    const centerLngRad = (centerLng * Math.PI) / 180;
    for (let i = 0; i <= steps; i += 1) {
      const bearing = (i * 2 * Math.PI) / steps;
      const latRad = Math.asin(
        Math.sin(centerLatRad) * Math.cos(angularDistance) +
          Math.cos(centerLatRad) * Math.sin(angularDistance) * Math.cos(bearing)
      );
      const lngRad =
        centerLngRad +
        Math.atan2(
          Math.sin(bearing) *
            Math.sin(angularDistance) *
            Math.cos(centerLatRad),
          Math.cos(angularDistance) - Math.sin(centerLatRad) * Math.sin(latRad)
        );
      const lat = (latRad * 180) / Math.PI;
      const lng = (lngRad * 180) / Math.PI;
      coordinates.push([lng, lat]);
    }
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [coordinates] },
          properties: {},
        },
      ],
    };
  }

  function addOrUpdateCenterCircle(map) {
    const sourceId = "admin-center-buffer";
    const fillLayerId = "admin-center-buffer-fill";
    const outlineLayerId = "admin-center-buffer-outline";
    const data = createCircleGeoJSON(defaultCenter.lng, defaultCenter.lat, 500);

    const existing = map.getSource(sourceId);
    if (existing) {
      existing.setData(data);
    } else {
      map.addSource(sourceId, { type: "geojson", data });
      map.addLayer({
        id: fillLayerId,
        type: "fill",
        source: sourceId,
        paint: { "fill-color": "#ef4444", "fill-opacity": 0.2 },
      });
      map.addLayer({
        id: outlineLayerId,
        type: "line",
        source: sourceId,
        paint: { "line-color": "#ef4444", "line-width": 2 },
      });
    }
  }

  function addCaseMarkers(map) {
    caseMarkersRef.current.forEach((m) => m.remove());
    caseMarkersRef.current = [];
    mockCases.forEach((item) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([item.location[1], item.location[0]])
        .setPopup(
          new mapboxgl.Popup({ offset: 16 }).setHTML(
            `<div class="p-2"><h3 class="font-semibold text-gray-900">${item.id}</h3><p class="text-sm text-gray-600">${item.category}</p><p class="text-sm">Risk: ${item.risk}</p></div>`
          )
        )
        .addTo(map);
      caseMarkersRef.current.push(marker);
    });
  }

  useEffect(() => {
    if (!token) return;
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;
    const initialStyle = mapLayers.satellite
      ? "mapbox://styles/mapbox/satellite-streets-v12"
      : "mapbox://styles/mapbox/streets-v12";
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [defaultCenter.lng, defaultCenter.lat],
      zoom: 13,
    });
    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );
    map.on("load", () => {
      addOrUpdateCenterCircle(map);
      addCaseMarkers(map);
    });

    return () => {
      caseMarkersRef.current.forEach((m) => m.remove());
      caseMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const style = mapLayers.satellite
      ? "mapbox://styles/mapbox/satellite-streets-v12"
      : "mapbox://styles/mapbox/streets-v12";
    map.setStyle(style);
    map.once("style.load", () => {
      addOrUpdateCenterCircle(map);
    });
  }, [mapLayers.satellite]);

  const getRiskColor = (risk) =>
    risk >= 80
      ? "text-red-600"
      : risk >= 60
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of reports, enforcement, and worker activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md">
            <Filter size={16} /> Filters
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center gap-2 shadow-md">
            <Calendar size={16} /> Date Range
          </button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Reports
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {kpis.totalReports}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <FileText
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verified Cases
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {kpis.verifiedCases}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Actions Taken
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {kpis.actionsTaken}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle
                className="text-red-600 dark:text-red-400"
                size={24}
              />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Closed Cases
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {kpis.closedCases}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle
                className="text-green-600 dark:text-green-400"
                size={24}
              />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pending Cases
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {kpis.pendingCases}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Clock
                className="text-yellow-600 dark:text-yellow-400"
                size={24}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">
            GIS Overview
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                setMapLayers((p) => ({ ...p, satellite: !p.satellite }))
              }
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mapLayers.satellite
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }`}
            >
              Satellite View
            </button>
            <button
              onClick={() =>
                setMapLayers((p) => ({ ...p, cadastral: !p.cadastral }))
              }
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mapLayers.cadastral
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }`}
            >
              Cadastral Boundaries
            </button>
            <button
              onClick={() => setMapLayers((p) => ({ ...p, drone: !p.drone }))}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mapLayers.drone
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }`}
            >
              Drone Imagery
            </button>
          </div>
        </div>
        <div className="h-96">
          {!token ? (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
              Set VITE_MAPBOX_TOKEN in client1/.env to view the map.
            </div>
          ) : (
            <div ref={mapContainerRef} className="w-full h-full" />
          )}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">
            Recent Reports
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
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
              {mockCases.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" /> {item.area}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.submittedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === "Pending"
                          ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                          : item.status === "Verified"
                          ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400"
                          : item.status === "Action Taken"
                          ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                          : "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
