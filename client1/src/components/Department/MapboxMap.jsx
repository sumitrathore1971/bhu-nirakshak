import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { addBoundaryToMap } from "../../lib/boundary";

export default function MapboxMap({
  height = 320,
  center = [75.8577, 22.7196],
  zoom = 11,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !mapContainerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom,
    });
    mapRef.current = map;
    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );
    map.on("load", async () => {
      try {
        await addBoundaryToMap(map, { zoomThreshold: 13 });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load boundary:", e);
      }
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token, center, zoom]);

  if (!token) {
    return (
      <div
        className="w-full flex items-center justify-center text-sm text-gray-600 dark:text-gray-300 border rounded-lg"
        style={{ height }}
      >
        Set VITE_MAPBOX_TOKEN in client1/.env to use the map.
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="w-full rounded-lg overflow-hidden border border-gray-200"
      style={{ height }}
    />
  );
}
