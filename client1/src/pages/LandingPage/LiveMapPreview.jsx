import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapboxStyleSwitcherControl } from "mapbox-gl-style-switcher";
import "mapbox-gl-style-switcher/styles.css";

const markers = [
  { lat: 22.7196, lng: 75.8577, label: "Illegal Construction #1" },
  { lat: 22.725, lng: 75.85, label: "Illegal Construction #2" },
  { lat: 22.715, lng: 75.86, label: "Illegal Construction #3" },
];

export default function LiveMapPreview() {
  const [currentView, setCurrentView] = useState("Global");
  const [isHovering, setIsHovering] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  // Define centers for global and Indore views
  const defaultCenter = { lat: 22.7196, lng: 75.8577 }; // Indore
  const globalCenter = { lat: 20, lng: 80 }; // Full globe view of India and surrounding regions

  useEffect(() => {
    if (!token) return;
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [globalCenter.lng, globalCenter.lat], // Start with full globe view
      zoom: 1, // Full globe zoom level to show entire India and surrounding regions
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

    // Add markers after map loads
    map.on("load", () => {
      markers.forEach((m) => {
        const popup = new mapboxgl.Popup({ offset: 24 }).setText(m.label);
        new mapboxgl.Marker()
          .setLngLat([m.lng, m.lat])
          .setPopup(popup)
          .addTo(map);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  // Handle hover events
  const handleMouseEnter = () => {
    if (mapRef.current && currentView === "Global") {
      setIsHovering(true);
      setCurrentView("Indore");

      // Fly to Indore with smooth animation
      mapRef.current.flyTo({
        center: [defaultCenter.lng, defaultCenter.lat],
        zoom: 12,
        duration: 2500, // 2.5 seconds animation
        essential: true,
      });
    }
  };

  const handleMouseLeave = () => {
    if (mapRef.current && currentView === "Indore") {
      setIsHovering(false);
      setCurrentView("Global");

      // Return to global view with smooth animation
      mapRef.current.flyTo({
        center: [globalCenter.lng, globalCenter.lat],
        zoom: 1, // Full globe zoom level
        duration: 2000, // 2 seconds animation
        essential: true,
      });
    }
  };

  return (
    <section id="live-map" className="py-20 bg-white dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-8 text-gray-900 dark:text-white">
          Live Map Preview
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
          Hover over the map to explore Indore in detail. Move away to see the
          broader view.
        </p>
        <div
          className="w-full h-[350px] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-neutral-800 relative cursor-pointer transition-all duration-300 hover:shadow-2xl"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {!token ? (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
              Set VITE_MAPBOX_TOKEN in client1/.env to view the map.
            </div>
          ) : (
            <>
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Global View Overlay */}
              {currentView === "Global" && (
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 dark:border-neutral-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    🌍 Full Globe View
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Hover to explore Indore, India
                  </p>
                </div>
              )}

              {/* Indore View Overlay */}
              {currentView === "Indore" && (
                <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-blue-500">
                  <p className="text-sm text-white font-medium">
                    🏙️ Indore City
                  </p>
                  <p className="text-xs text-blue-100 mt-1">
                    Move away to return to global view
                  </p>
                </div>
              )}

              {/* Hover Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                {isHovering ? "Exploring Indore..." : "Hover to zoom in"}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
