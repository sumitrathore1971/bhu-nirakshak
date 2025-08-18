import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { MapboxStyleSwitcherControl } from "mapbox-gl-style-switcher";
import "mapbox-gl-style-switcher/styles.css";
import { addBoundaryToMap } from "../../lib/boundary";

export default function MapSelector({ value, onChange, onPolygonChange }) {
  const [baseLayer, setBaseLayer] = useState("osm");
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  // Marker removed (no pin placement)
  const drawRef = useRef(null);
  const isDrawingRef = useRef(false);
  const clickHandlerRef = useRef(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  const center = useMemo(
    () =>
      value?.lat && value?.lng
        ? { lat: value.lat, lng: value.lng }
        : { lat: 22.7196, lng: 75.8577 },
    [value]
  );

  // Search bar removed per requirement

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

    // Mapbox Draw (Polygon only)
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      defaultMode: "draw_polygon",
    });
    drawRef.current = draw;
    map.addControl(draw, "top-left");

    // Start in drawing state because defaultMode is draw_polygon
    isDrawingRef.current = true;

    // Track draw mode to avoid interfering clicks while drawing
    map.on("draw.modechange", (e) => {
      const mode = e?.mode || "";
      // Only allow clicks to place marker in simple_select/static
      isDrawingRef.current = !(mode === "simple_select" || mode === "static");
    });

    const handleMapClick = (e) => {
      // No-op: pin placement removed
      if (isDrawingRef.current) return;
      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;
      if (typeof onChange === "function")
        onChange({ ...(value || {}), lat, lng });
    };
    clickHandlerRef.current = handleMapClick;
    // Do not attach click while drawing (default mode). It will be attached later when mode switches
    if (!isDrawingRef.current) {
      map.on("click", handleMapClick);
    }

    function emitPolygon() {
      if (!onPolygonChange) return;
      const fc = draw.getAll();
      const first = fc.features?.find((f) => f.geometry?.type === "Polygon");
      onPolygonChange(first ? first.geometry : null);
    }
    map.on("draw.create", (e) => {
      emitPolygon();
      // After creating a polygon, switch to simple_select so clicks can place marker again
      try {
        draw.changeMode("simple_select");
      } catch {}
    });
    map.on("draw.update", emitPolygon);
    map.on("draw.delete", emitPolygon);

    // Mode change: toggle click handler
    map.on("draw.modechange", (e) => {
      const mode = e?.mode || "";
      const drawing = !(mode === "simple_select" || mode === "static");
      isDrawingRef.current = drawing;
      try {
        if (drawing) {
          if (clickHandlerRef.current)
            map.off("click", clickHandlerRef.current);
        } else {
          if (clickHandlerRef.current) map.on("click", clickHandlerRef.current);
        }
      } catch {}
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
      // No marker cleanup needed
      if (map && drawRef.current) {
        try {
          map.removeControl(drawRef.current);
        } catch {}
        drawRef.current = null;
      }
      if (map && clickHandlerRef.current) {
        try {
          map.off("click", clickHandlerRef.current);
        } catch {}
        clickHandlerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  // Respond to external value changes by recentering only (no marker)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (value?.lat && value?.lng) {
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
      <div className="absolute bottom-3 left-3 z-[500]">
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
