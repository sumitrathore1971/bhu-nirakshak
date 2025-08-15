import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapboxStyleSwitcherControl } from "mapbox-gl-style-switcher";
import "mapbox-gl-style-switcher/styles.css";
import { addBoundaryToMap } from "../../lib/boundary";

export default function MapSelector({ value, onChange }) {
  const [baseLayer, setBaseLayer] = useState("osm");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  const center = useMemo(
    () =>
      value?.lat && value?.lng
        ? { lat: value.lat, lng: value.lng }
        : { lat: 22.7196, lng: 75.8577 },
    [value]
  );

  async function handleSearch(ev) {
    ev.preventDefault();
    if (!query.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setResults(data || []);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectResult(r) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    const areaGuess = r.address?.suburb || r.address?.neighbourhood || r.address?.city_district || r.address?.city || r.address?.town || r.address?.village || '';
    onChange({ ...(value || {}), lat, lng, address: r.display_name, area: areaGuess });
    setResults([]);
  }

  // Initialize map
  useEffect(() => {
    if (!token) return;
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;
    const initialStyle =
      baseLayer === "osm"
        ? "mapbox://styles/mapbox/streets-v12"
        : "mapbox://styles/mapbox/satellite-streets-v12";
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [center.lng, center.lat],
      zoom: 12.5,
    });
    mapRef.current = map;

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

    map.on("click", (e) => {
      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;
      if (typeof onChange === "function") onChange({ ...(value || {}), lat, lng });
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map);
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }
    });

    map.on("load", async () => {
      try {
        await addBoundaryToMap(map, { zoomThreshold: 13 });
      } catch (e) {
        console.error("Failed to load boundary:", e);
      }
    });

    map.on("style.load", async () => {
      try {
        await addBoundaryToMap(map, { zoomThreshold: 13 });
      } catch (e) {
        console.error("Failed to load boundary:", e);
      }
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  // Respond to external value changes by moving marker and recentering
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (value?.lat && value?.lng) {
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker()
          .setLngLat([value.lng, value.lat])
          .addTo(map);
      } else {
        markerRef.current.setLngLat([value.lng, value.lat]);
      }
      map.flyTo({
        center: [value.lng, value.lat],
        zoom: Math.max(map.getZoom(), 13),
        essential: true,
      });
    }
  }, [value]);

  // Switch base style
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const style =
      baseLayer === "osm"
        ? "mapbox://styles/mapbox/streets-v12"
        : "mapbox://styles/mapbox/satellite-streets-v12";
    map.setStyle(style);
  }, [baseLayer]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-3 left-3 right-3 z-[500] flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search location (e.g., Rajwada, Indore)"
              className="w-full px-3 py-2 bg-white/95 border rounded-md shadow"
            />
          </form>
          <div className="bg-white rounded-md border shadow inline-flex p-1">
            <button
              type="button"
              onClick={() => setBaseLayer("osm")}
              className={`px-3 py-1 rounded ${
                baseLayer === "osm" ? "bg-gray-100" : ""
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setBaseLayer("satellite")}
              className={`px-3 py-1 rounded ${
                baseLayer === "satellite" ? "bg-gray-100" : ""
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-white border rounded-md shadow max-h-56 overflow-auto"
            >
              {results.map((r) => (
                <button
                  key={`${r.place_id}`}
                  type="button"
                  onClick={() => handleSelectResult(r)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                >
                  {r.display_name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!token ? (
        <div className="w-full h-[420px] md:h-full rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
          Set VITE_MAPBOX_TOKEN in client1/.env to use the map.
        </div>
      ) : (
        <div
          ref={mapContainerRef}
          className="w-full h-[420px] md:h-full rounded-lg overflow-hidden border border-gray-200"
        />
      )}
    </div>
  );
}
