import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { MapboxStyleSwitcherControl } from "mapbox-gl-style-switcher";
import "mapbox-gl-style-switcher/styles.css";
import {
  MapPin,
  Calendar,
  User,
  FileText,
  Download,
  Trash2,
  Save,
  Filter,
  Database,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  Edit3,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import reportService from "../../services/reportService.js";
import drawingService from "../../services/drawingService.js";
import { addBoundaryToMap } from "../../lib/boundary";
import { notificationEvents } from "./NotificationPanel.jsx"; // Import the global event system

const kpis = {
  totalReports: 324,
  verifiedCases: 167,
  actionsTaken: 112,
  closedCases: 78,
  pendingCases: 89,
};

export default function AdminDashboardHome() {
  const { isAuthenticated, user } = useAuth();
  const [recentReports, setRecentReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [mapLayers, setMapLayers] = useState({
    streets: false,
    satellite: false,
  });
  const [currentView, setCurrentView] = useState("Global");
  const [drawMode, setDrawMode] = useState(false);
  const [drawnFeatures, setDrawnFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [drawingTag, setDrawingTag] = useState("");
  const [savedDrawings, setSavedDrawings] = useState([]);
  const [loadingDrawings, setLoadingDrawings] = useState(false);
  const [selectedSavedDrawing, setSelectedSavedDrawing] = useState(null);
  const [showSavedDrawingsList, setShowSavedDrawingsList] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const caseMarkersRef = useRef([]);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const defaultCenter = { lat: 22.7196, lng: 75.8577 };
  const globalCenter = { lat: 23.5, lng: 78.5 }; // Broader view of central India

  // Calculate area of a polygon in square kilometers
  function calculateArea(coordinates) {
    if (coordinates.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      area += coordinates[i][0] * coordinates[j][1];
      area -= coordinates[j][0] * coordinates[i][1];
    }
    area = Math.abs(area) / 2;

    // Convert to square kilometers (approximate)
    const earthRadius = 6371; // km
    return area * (Math.PI / 180) * (Math.PI / 180) * earthRadius * earthRadius;
  }

  // Calculate length of a line in kilometers
  function calculateLength(coordinates) {
    if (coordinates.length < 2) return 0;

    let length = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const lat1 = (coordinates[i][1] * Math.PI) / 180;
      const lat2 = (coordinates[i + 1][1] * Math.PI) / 180;
      const dLat =
        ((coordinates[i + 1][1] - coordinates[i][1]) * Math.PI) / 180;
      const dLng =
        ((coordinates[i + 1][0] - coordinates[i][0]) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) *
          Math.cos(lat2) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      length += 6371 * c; // Earth radius in km
    }
    return length;
  }

  // Utility function to calculate bounds for features and fly to them
  function flyToFeatures(features, label = "") {
    if (!features || features.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    features.forEach((feature) => {
      if (feature.geometry && feature.geometry.coordinates) {
        if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates[0].forEach((coord) => {
            bounds.extend(coord);
          });
        } else if (feature.geometry.type === "LineString") {
          feature.geometry.coordinates.forEach((coord) => {
            bounds.extend(coord);
          });
        } else if (feature.geometry.type === "Point") {
          bounds.extend(feature.geometry.coordinates);
        }
      }
    });

    if (!bounds.isEmpty()) {
      console.log(`Flying to ${label} feature bounds:`, bounds);
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  }

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
    recentReports.forEach((item) => {
      if (item.location?.coordinates?.coordinates) {
        const [lng, lat] = item.location.coordinates.coordinates;
        const marker = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 16 }).setHTML(
              `<div class="p-2"><h3 class="font-semibold text-gray-900">${item.reportId}</h3><p class="text-sm text-gray-600">${item.category}</p><p class="text-sm">Status: ${item.status}</p></div>`
            )
          )
          .addTo(map);
        caseMarkersRef.current.push(marker);
      }
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
      center: [globalCenter.lng, globalCenter.lat],
      zoom: 5, // Start with a global view
    });
    mapRef.current = map;

    // Initialize Draw plugin
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
        line_string: true,
        point: true,
      },
      styles: [
        // Polygon fill
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: {
            "fill-color": "#088",
            "fill-outline-color": "#088",
            "fill-opacity": 0.1,
          },
        },
        // Polygon outline
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#088",
            "line-dasharray": [0.2, 2],
            "line-width": 2,
          },
        },
        // Line
        {
          id: "gl-draw-line-active",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "LineString"],
            ["==", "active", "true"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#088",
            "line-dasharray": [0.2, 2],
            "line-width": 2,
          },
        },
        // Point
        {
          id: "gl-draw-point-active",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "active", "true"]],
          paint: {
            "circle-radius": 6,
            "circle-color": "#088",
          },
        },
      ],
    });

    map.addControl(draw, "top-left");
    drawRef.current = draw;

    // Handle draw events
    map.on("draw.create", (e) => {
      const features = draw.getAll();
      // Calculate properties for new features
      features.features.forEach((feature) => {
        if (feature.geometry.type === "Polygon") {
          feature.properties.area = calculateArea(
            feature.geometry.coordinates[0]
          );
        } else if (feature.geometry.type === "LineString") {
          feature.properties.length = calculateLength(
            feature.geometry.coordinates
          );
        }
      });
      setDrawnFeatures(features.features);
      console.log("Created features:", features.features);
    });

    map.on("draw.update", (e) => {
      const features = draw.getAll();
      // Recalculate properties for updated features
      features.features.forEach((feature) => {
        if (feature.geometry.type === "Polygon") {
          feature.properties.area = calculateArea(
            feature.geometry.coordinates[0]
          );
        } else if (feature.geometry.type === "LineString") {
          feature.properties.length = calculateLength(
            feature.geometry.coordinates
          );
        }
      });
      setDrawnFeatures(features.features);
      console.log("Updated features:", features.features);
    });

    map.on("draw.delete", (e) => {
      const features = draw.getAll();
      setDrawnFeatures(features.features);
      console.log("Deleted features:", features.features);
    });

    map.on("draw.selectionchange", (e) => {
      if (e.features.length > 0) {
        setSelectedFeature(e.features[0]);
      } else {
        setSelectedFeature(null);
      }
    });

    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );
    const styles = [
      { title: "Streets", uri: "mapbox://styles/mapbox/streets-v12" },
      {
        title: "Satellite",
        uri: "mapbox://styles/mapbox/satellite-streets-v12",
      },
      { title: "Dark", uri: "mapbox://styles/mapbox/dark-v11" },
    ];
    map.addControl(new MapboxStyleSwitcherControl(styles), "top-left");
    map.on("style.load", async () => {
      try {
        await addBoundaryToMap(map, { zoomThreshold: 13 });
      } catch (e) {
        console.error("Failed to load boundary:", e);
      }
    });
    map.on("load", async () => {
      addOrUpdateCenterCircle(map);
      addCaseMarkers(map);
      try {
        await addBoundaryToMap(map, { zoomThreshold: 13 });
      } catch (e) {
        console.error("Failed to load boundary:", e);
      }

      // Fly to Indore after a short delay for better user experience
      setTimeout(() => {
        map.flyTo({
          center: [defaultCenter.lng, defaultCenter.lat],
          zoom: 11,
          duration: 3000, // 3 seconds animation
          essential: true,
        });
        setCurrentView("Indore");
      }, 1000); // 1 second delay
    });

    return () => {
      caseMarkersRef.current.forEach((m) => m.remove());
      caseMarkersRef.current = [];
      if (drawRef.current) {
        map.removeControl(drawRef.current);
      }
      map.remove();
      mapRef.current = null;
      drawRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const style = mapLayers.satellite
      ? "mapbox://styles/mapbox/satellite-streets-v12"
      : "mapbox://styles/mapbox/streets-v12";
    map.setStyle(style);
    map.once("style.load", async () => {
      addOrUpdateCenterCircle(map);
    });
  }, [mapLayers.satellite]);

  // Fetch recent reports
  const fetchRecentReports = async () => {
    try {
      setReportsLoading(true);
      const response = await reportService.getAllReports(1, 10);
      // Handle both new and old response formats
      if (response.success || response.data) {
        const data = response.data || response;
        setRecentReports(data.reports || []);

        // Update map markers if map is loaded
        if (mapRef.current && mapRef.current.isStyleLoaded()) {
          addCaseMarkers(mapRef.current);
        }
      }
    } catch (error) {
      console.error("Error fetching recent reports:", error);
    } finally {
      setReportsLoading(false);
    }
  };

  // Handle new report notifications
  const handleNewReport = (data) => {
    console.log("📢 Received new report notification in dashboard:", data);
    // Add the new report to the beginning of the list
    setRecentReports((prev) => [data.report, ...prev.slice(0, -1)]); // Keep the same number of items

    // Update map markers if map is loaded
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      addCaseMarkers(mapRef.current);
    }
  };

  // Subscribe to global notification events
  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe(handleNewReport);
    return unsubscribe;
  }, []);

  // Load saved drawings and recent reports on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadSavedDrawings();
      fetchRecentReports();
    }
  }, [isAuthenticated]);

  const getRiskColor = (risk) =>
    risk >= 80
      ? "text-red-600"
      : risk >= 60
      ? "text-yellow-600"
      : "text-green-600";

  const toggleDrawMode = () => {
    if (!drawRef.current) return;

    if (drawMode) {
      // Exit draw mode
      drawRef.current.changeMode("simple_select");
      setDrawMode(false);
    } else {
      // Enter draw mode
      drawRef.current.changeMode("draw_polygon");
      setDrawMode(true);
    }
  };

  const clearAllDrawings = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
      setDrawnFeatures([]);
    }
  };

  const saveDrawings = () => {
    if (drawnFeatures.length > 0) {
      setShowSaveDialog(true);
    }
  };

  const handleSaveWithTag = () => {
    if (drawnFeatures.length > 0 && drawingTag.trim()) {
      // Create enhanced data structure with metadata
      const enhancedData = {
        metadata: {
          tagName: drawingTag.trim(),
          exportDate: new Date().toISOString(),
          featureCount: drawnFeatures.length,
          featureTypes: {
            polygons: drawnFeatures.filter((f) => f.geometry.type === "Polygon")
              .length,
            lines: drawnFeatures.filter((f) => f.geometry.type === "LineString")
              .length,
            points: drawnFeatures.filter((f) => f.geometry.type === "Point")
              .length,
          },
        },
        features: drawnFeatures,
      };

      const dataStr = JSON.stringify(enhancedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${drawingTag.trim()}-drawings.json`;
      link.click();
      URL.revokeObjectURL(url);
      setShowSaveDialog(false);
      setDrawingTag("");
    }
  };

  const cancelSave = () => {
    setShowSaveDialog(false);
    setDrawingTag("");
  };

  // Load saved drawings from backend
  const loadSavedDrawings = async () => {
    if (!isAuthenticated) {
      console.log("User not authenticated, skipping load saved drawings");
      return;
    }

    try {
      setLoadingDrawings(true);
      const response = await drawingService.getDrawings();
      if (response.success) {
        setSavedDrawings(response.data);
      }
    } catch (error) {
      console.error("Failed to load saved drawings:", error);
    } finally {
      setLoadingDrawings(false);
    }
  };

  // Save drawing to backend
  const saveDrawingToBackend = async () => {
    if (!isAuthenticated) {
      alert("Please log in to save drawings.");
      return;
    }

    if (drawnFeatures.length > 0 && drawingTag.trim()) {
      try {
        const enhancedData = {
          tagName: drawingTag.trim(),
          features: drawnFeatures,
          metadata: {
            tagName: drawingTag.trim(),
            exportDate: new Date().toISOString(),
            featureCount: drawnFeatures.length,
            featureTypes: {
              polygons: drawnFeatures.filter(
                (f) => f.geometry.type === "Polygon"
              ).length,
              lines: drawnFeatures.filter(
                (f) => f.geometry.type === "LineString"
              ).length,
              points: drawnFeatures.filter((f) => f.geometry.type === "Point")
                .length,
            },
          },
        };

        const response = await drawingService.saveDrawing(enhancedData);
        if (response.success) {
          // Refresh saved drawings list
          await loadSavedDrawings();
          setShowSaveDialog(false);
          setDrawingTag("");
          // Clear current drawings
          if (drawRef.current) {
            drawRef.current.deleteAll();
            setDrawnFeatures([]);
          }
        }
      } catch (error) {
        console.error("Failed to save drawing to backend:", error);
        alert("Failed to save drawing. Please try again.");
      }
    }
  };

  // Load a saved drawing onto the map
  const loadSavedDrawing = async (drawingId) => {
    if (!isAuthenticated) {
      alert("Please log in to load drawings.");
      return;
    }

    try {
      const response = await drawingService.getDrawing(drawingId);
      if (response.success) {
        const drawing = response.data;
        console.log("Loaded drawing data:", drawing);
        console.log("Drawing features type:", typeof drawing.features);
        console.log("Drawing features:", drawing.features);
        console.log("Drawing metadata:", drawing.metadata);

        // Clear current drawings
        if (drawRef.current) {
          drawRef.current.deleteAll();
        } else {
          console.error("Draw reference is not available");
          alert(
            "Map drawing tools are not ready. Please refresh the page and try again."
          );
          return;
        }

        // Add saved features to the map
        if (
          drawing.features &&
          Array.isArray(drawing.features) &&
          drawing.features.length > 0
        ) {
          console.log("Adding features to map:", drawing.features);

          // Validate GeoJSON structure
          const validFeatures = drawing.features.filter(
            (feature) =>
              feature &&
              feature.type === "Feature" &&
              feature.geometry &&
              feature.geometry.type &&
              feature.geometry.coordinates
          );

          if (validFeatures.length === 0) {
            console.error("No valid GeoJSON features found in drawing");
            alert("The drawing contains no valid GeoJSON features to display.");
            return;
          }

          try {
            console.log(
              "Valid features to add:",
              JSON.stringify(validFeatures, null, 2)
            );

            // Create a proper GeoJSON FeatureCollection for Mapbox Draw
            const featureCollection = {
              type: "FeatureCollection",
              features: validFeatures,
            };

            console.log(
              "FeatureCollection to add:",
              JSON.stringify(featureCollection, null, 2)
            );
            drawRef.current.add(featureCollection);

            // Check if features were actually added
            const allFeatures = drawRef.current.getAll();
            console.log("All features after adding:", allFeatures);
            console.log(
              "Number of features in draw layer:",
              allFeatures.features.length
            );

            // Check draw layer configuration
            console.log("Draw layer modes:", drawRef.current.getMode());
            console.log("Draw layer options:", drawRef.current.options);

            setDrawnFeatures(validFeatures);
            setSelectedSavedDrawing(drawing);

            // Check current map view
            const center = mapRef.current.getCenter();
            const zoom = mapRef.current.getZoom();
            console.log("Current map center:", center);
            console.log("Current map zoom:", zoom);
            console.log("Map loaded:", mapRef.current.isStyleLoaded());
            console.log("Map style:", mapRef.current.getStyle().sources);

            // Fly to the features to make sure they're visible
            flyToFeatures(validFeatures, "main");
          } catch (addError) {
            console.error("Error adding features to map:", addError);
            console.error("Error details:", {
              message: addError.message,
              stack: addError.stack,
              features: validFeatures,
            });
            alert(
              `Error displaying drawing features: ${
                addError.message || "Unknown error"
              }. The drawing data may be corrupted.`
            );
          }
        } else if (
          drawing.metadata &&
          drawing.metadata.features &&
          Array.isArray(drawing.metadata.features) &&
          drawing.metadata.features.length > 0
        ) {
          // Fallback: try to get features from metadata
          console.log(
            "Using features from metadata:",
            drawing.metadata.features
          );

          // Validate GeoJSON structure for metadata features
          const validMetadataFeatures = drawing.metadata.features.filter(
            (feature) =>
              feature &&
              feature.type === "Feature" &&
              feature.geometry &&
              feature.geometry.type &&
              feature.geometry.coordinates
          );

          if (validMetadataFeatures.length === 0) {
            console.error("No valid GeoJSON features found in metadata");
            alert(
              "The drawing metadata contains no valid GeoJSON features to display."
            );
            return;
          }

          try {
            console.log(
              "Valid metadata features to add:",
              JSON.stringify(validMetadataFeatures, null, 2)
            );

            // Create a proper GeoJSON FeatureCollection for Mapbox Draw
            const metadataFeatureCollection = {
              type: "FeatureCollection",
              features: validMetadataFeatures,
            };

            console.log(
              "Metadata FeatureCollection to add:",
              JSON.stringify(metadataFeatureCollection, null, 2)
            );
            drawRef.current.add(metadataFeatureCollection);

            // Check if features were actually added
            const allFeatures = drawRef.current.getAll();
            console.log("All features after adding (metadata):", allFeatures);
            console.log(
              "Number of features in draw layer (metadata):",
              allFeatures.features.length
            );

            // Check draw layer configuration
            console.log(
              "Draw layer modes (metadata):",
              drawRef.current.getMode()
            );
            console.log(
              "Draw layer options (metadata):",
              drawRef.current.options
            );

            setDrawnFeatures(validMetadataFeatures);
            setSelectedSavedDrawing(drawing);

            // Check current map view
            const center = mapRef.current.getCenter();
            const zoom = mapRef.current.getZoom();
            console.log("Current map center (metadata):", center);
            console.log("Current map zoom (metadata):", zoom);
            console.log(
              "Map loaded (metadata):",
              mapRef.current.isStyleLoaded()
            );
            console.log(
              "Map style (metadata):",
              mapRef.current.getStyle().sources
            );

            // Fly to the features to make sure they're visible
            flyToFeatures(validMetadataFeatures, "metadata");
          } catch (addError) {
            console.error(
              "Error adding features from metadata to map:",
              addError
            );
            console.error("Error details:", {
              message: addError.message,
              stack: addError.stack,
              features: validMetadataFeatures,
            });
            alert(
              `Error displaying drawing features from metadata: ${
                addError.message || "Unknown error"
              }. The drawing data may be corrupted.`
            );
          }
        } else {
          // Fallback 1: Try to extract features from the entire drawing object
          console.log(
            "Attempting fallback 1: Extract features from drawing object"
          );
          let fallbackFeatures = [];

          // Look for features in various possible locations
          if (drawing.features && Array.isArray(drawing.features)) {
            fallbackFeatures = drawing.features;
          } else if (
            drawing.data &&
            drawing.data.features &&
            Array.isArray(drawing.data.features)
          ) {
            fallbackFeatures = drawing.data.features;
          } else if (drawing.geometry && drawing.geometry.type) {
            // Single feature case
            fallbackFeatures = [
              {
                type: "Feature",
                geometry: drawing.geometry,
                properties: drawing.properties || {},
              },
            ];
          } else if (typeof drawing === "object") {
            // Try to find any array that might contain features
            for (const [key, value] of Object.entries(drawing)) {
              if (
                Array.isArray(value) &&
                value.length > 0 &&
                value[0] &&
                value[0].type === "Feature"
              ) {
                fallbackFeatures = value;
                console.log(`Found features in key: ${key}`);
                break;
              }
            }
          }

          if (fallbackFeatures.length > 0) {
            console.log(
              "Fallback 1 successful, found features:",
              fallbackFeatures
            );

            // Validate the fallback features
            const validFallbackFeatures = fallbackFeatures.filter(
              (feature) =>
                feature &&
                feature.type === "Feature" &&
                feature.geometry &&
                feature.geometry.type &&
                feature.geometry.coordinates
            );

            if (validFallbackFeatures.length > 0) {
              try {
                const fallbackFeatureCollection = {
                  type: "FeatureCollection",
                  features: validFallbackFeatures,
                };

                console.log(
                  "Adding fallback features:",
                  JSON.stringify(fallbackFeatureCollection, null, 2)
                );
                drawRef.current.add(fallbackFeatureCollection);

                // Check if features were actually added
                const allFeatures = drawRef.current.getAll();
                console.log("All features after fallback:", allFeatures);
                console.log(
                  "Number of features in draw layer (fallback):",
                  allFeatures.features.length
                );

                setDrawnFeatures(validFallbackFeatures);
                setSelectedSavedDrawing(drawing);

                // Fly to the features
                flyToFeatures(validFallbackFeatures, "fallback");

                return; // Success, exit early
              } catch (fallbackError) {
                console.error("Fallback 1 failed:", fallbackError);
              }
            }
          }

          // Fallback 2: Try to reconstruct features from coordinates if available
          console.log(
            "Attempting fallback 2: Reconstruct features from coordinates"
          );
          if (
            drawing.coordinates ||
            drawing.geometry ||
            drawing.polygon ||
            drawing.line
          ) {
            let reconstructedFeatures = [];

            if (drawing.coordinates && Array.isArray(drawing.coordinates)) {
              // Assume it's a polygon if it's a nested array
              if (Array.isArray(drawing.coordinates[0])) {
                reconstructedFeatures.push({
                  type: "Feature",
                  geometry: {
                    type: "Polygon",
                    coordinates: [drawing.coordinates],
                  },
                  properties: {},
                });
              }
            } else if (drawing.geometry) {
              reconstructedFeatures.push({
                type: "Feature",
                geometry: drawing.geometry,
                properties: drawing.properties || {},
              });
            }

            if (reconstructedFeatures.length > 0) {
              try {
                const reconstructedFeatureCollection = {
                  type: "FeatureCollection",
                  features: reconstructedFeatures,
                };

                console.log(
                  "Adding reconstructed features:",
                  JSON.stringify(reconstructedFeatureCollection, null, 2)
                );
                drawRef.current.add(reconstructedFeatureCollection);

                setDrawnFeatures(reconstructedFeatures);
                setSelectedSavedDrawing(drawing);

                // Fly to the features
                flyToFeatures(reconstructedFeatures, "reconstructed");

                return; // Success, exit early
              } catch (reconstructError) {
                console.error("Fallback 2 failed:", reconstructError);
              }
            }
          }

          // If all fallbacks fail, show error
          console.warn(
            "All fallbacks failed. No valid features found in drawing:",
            drawing
          );
          alert(
            "This drawing has no valid features to display. The data structure may be incompatible."
          );
        }

        // Close the saved drawings list
        setShowSavedDrawingsList(false);
      } else {
        console.error(
          "Failed to load drawing - response not successful:",
          response
        );
        alert("Failed to load drawing. Please try again.");
      }
    } catch (error) {
      console.error("Failed to load saved drawing:", error);
      alert("Failed to load drawing. Please try again.");
    }
  };

  // Delete a saved drawing
  const deleteSavedDrawing = async (drawingId) => {
    if (!isAuthenticated) {
      alert("Please log in to delete drawings.");
      return;
    }

    if (confirm("Are you sure you want to delete this drawing?")) {
      try {
        const response = await drawingService.deleteDrawing(drawingId);
        if (response.success) {
          // Refresh saved drawings list
          await loadSavedDrawings();
          // If this was the currently loaded drawing, clear it
          if (selectedSavedDrawing && selectedSavedDrawing.id === drawingId) {
            setSelectedSavedDrawing(null);
            if (drawRef.current) {
              drawRef.current.deleteAll();
              setDrawnFeatures([]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to delete drawing:", error);
        alert("Failed to delete drawing. Please try again.");
      }
    }
  };

  // Export saved drawing as JSON file
  const exportSavedDrawing = (drawing) => {
    const dataStr = JSON.stringify(drawing, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${drawing.tagName}-drawings.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">
              GIS Overview
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current View:{" "}
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {currentView}
              </span>
            </div>
          </div>
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
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.flyTo({
                    center: [defaultCenter.lng, defaultCenter.lat],
                    zoom: 11,
                    duration: 2000,
                    essential: true,
                  });
                  setCurrentView("Indore");
                }
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
            >
              Focus on Indore
            </button>
            <button
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.flyTo({
                    center: [globalCenter.lng, globalCenter.lat],
                    zoom: 5,
                    duration: 2000,
                    essential: true,
                  });
                  setCurrentView("Global");
                }
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
            >
              Global View
            </button>
          </div>

          {/* Draw Controls */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Drawing Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleDrawMode}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  drawMode
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {drawMode ? <X size={16} /> : <Edit3 size={16} />}
                {drawMode ? "Exit Draw Mode" : "Enter Draw Mode"}
              </button>

              <button
                onClick={() => setShowSavedDrawingsList(!showSavedDrawingsList)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/30 flex items-center gap-2"
              >
                <Database size={16} />
                Saved Drawings ({savedDrawings.length})
              </button>

              {drawnFeatures.length > 0 && (
                <>
                  <button
                    onClick={saveDrawings}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save ({drawnFeatures.length})
                  </button>
                  <button
                    onClick={clearAllDrawings}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Clear All
                  </button>
                </>
              )}
            </div>

            {drawnFeatures.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Features drawn: {drawnFeatures.length} | Use the drawing tools
                  on the left side of the map
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {
                    drawnFeatures.filter((f) => f.geometry.type === "Polygon")
                      .length
                  }{" "}
                  polygons,
                  {
                    drawnFeatures.filter(
                      (f) => f.geometry.type === "LineString"
                    ).length
                  }{" "}
                  lines,
                  {
                    drawnFeatures.filter((f) => f.geometry.type === "Point")
                      .length
                  }{" "}
                  points
                </div>
              </div>
            )}

            {!drawMode && (
              <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                💡 Tip: Click "Enter Draw Mode" to start drawing. Use the tools
                on the left side of the map for precise control.
              </div>
            )}
          </div>

          {/* Save Dialog */}
          {showSaveDialog && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={cancelSave}
            >
              <div
                className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-neutral-700"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Save Drawing
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="drawingTag"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Drawing Tag Name
                    </label>
                    <input
                      type="text"
                      id="drawingTag"
                      value={drawingTag}
                      onChange={(e) => setDrawingTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && drawingTag.trim()) {
                          handleSaveWithTag();
                        } else if (e.key === "Escape") {
                          cancelSave();
                        }
                      }}
                      placeholder="Enter a name for your drawing..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      autoFocus
                    />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Features to save: {drawnFeatures.length}</p>
                    <p>
                      File will be saved as:{" "}
                      <span className="font-mono text-xs bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">
                        {drawingTag.trim() || "your-tag"}-drawings.json
                      </span>
                    </p>
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-neutral-800 rounded text-xs">
                      <p className="font-medium mb-1">JSON Structure:</p>
                      <div className="font-mono text-xs space-y-1">
                        <div>├── metadata</div>
                        <div>
                          │ ├── tagName: &quot;{drawingTag.trim() || "your-tag"}
                          &quot;
                        </div>
                        <div>
                          │ ├── exportDate:{" "}
                          {new Date().toISOString().split("T")[0]}
                        </div>
                        <div>│ ├── featureCount: {drawnFeatures.length}</div>
                        <div>│ └── featureTypes: &#123;...&#125;</div>
                        <div>└── features: [{drawnFeatures.length} items]</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={saveDrawingToBackend}
                      disabled={!drawingTag.trim()}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save size={16} />
                      Save to Database
                    </button>
                    <button
                      onClick={cancelSave}
                      className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="h-96 relative">
          {!token ? (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
              Set VITE_MAPBOX_TOKEN in client1/.env to view the map.
            </div>
          ) : (
            <>
              <div ref={mapContainerRef} className="w-full h-full" />
              {currentView === "Global" && (
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 dark:border-neutral-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    🌍 Global View - Central India
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Flying to Indore in a moment...
                  </p>
                </div>
              )}

              {/* Feature Info Panel */}
              {selectedFeature && (
                <div className="absolute top-4 right-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200 dark:border-neutral-700 max-w-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Feature Details
                    </h4>
                    <button
                      onClick={() => setSelectedFeature(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      {selectedFeature.geometry.type}
                    </div>
                    {selectedFeature.properties &&
                      selectedFeature.properties.area && (
                        <div>
                          <span className="font-medium">Area:</span>{" "}
                          {selectedFeature.properties.area.toFixed(2)} km²
                        </div>
                      )}
                    {selectedFeature.properties &&
                      selectedFeature.properties.length && (
                        <div>
                          <span className="font-medium">Length:</span>{" "}
                          {selectedFeature.properties.length.toFixed(2)} km
                        </div>
                      )}
                    <div>
                      <span className="font-medium">Coordinates:</span>{" "}
                      {selectedFeature.geometry.coordinates.length} points
                    </div>
                  </div>
                </div>
              )}
            </>
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
              {reportsLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                      Loading reports...
                    </p>
                  </td>
                </tr>
              ) : recentReports.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-600 dark:text-gray-400"
                  >
                    No reports found
                  </td>
                </tr>
              ) : (
                recentReports.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.reportId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />{" "}
                      {item.location?.area || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.reporter?.fullName || "Anonymous"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(item.dateOfObservation).toLocaleDateString(
                        "en-IN",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Drawings List */}
      {showSavedDrawingsList && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">
                Saved Drawings
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadSavedDrawings}
                  disabled={loadingDrawings}
                  className="px-3 py-2 text-sm font-medium transition-colors bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg disabled:opacity-50"
                >
                  {loadingDrawings ? "Loading..." : "Refresh"}
                </button>
                <button
                  onClick={() => setShowSavedDrawingsList(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loadingDrawings ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Loading saved drawings...
                </p>
              </div>
            ) : savedDrawings.length === 0 ? (
              <div className="text-center py-8">
                <Database size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No saved drawings yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Create and save your first drawing to see it here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedDrawings.map((drawing) => (
                  <div
                    key={drawing.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      selectedSavedDrawing?.id === drawing.id
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800"
                    }`}
                    onClick={() => loadSavedDrawing(drawing.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {drawing.tagName}
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportSavedDrawing(drawing);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="Export as JSON"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSavedDrawing(drawing.id);
                          }}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          title="Delete drawing"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Features:</span>
                        <span className="font-medium">
                          {drawing.featureCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Created:</span>
                        <span className="font-medium">
                          {new Date(drawing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {drawing.featureTypes.polygons > 0 && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                            {drawing.featureTypes.polygons} Polygons
                          </span>
                        )}
                        {drawing.featureTypes.lines > 0 && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded">
                            {drawing.featureTypes.lines} Lines
                          </span>
                        )}
                        {drawing.featureTypes.points > 0 && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded">
                            {drawing.featureTypes.points} Points
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedSavedDrawing?.id === drawing.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
                        <div className="flex items-center gap-2 text-primary text-sm">
                          <Eye size={16} />
                          <span>Currently Loaded</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
