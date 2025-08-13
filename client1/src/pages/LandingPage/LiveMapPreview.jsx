import React, { useEffect, useRef } from "react";
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
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token) return;
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [75.8577, 22.7196],
      zoom: 12,
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

    markers.forEach((m) => {
      const popup = new mapboxgl.Popup({ offset: 24 }).setText(m.label);
      new mapboxgl.Marker()
        .setLngLat([m.lng, m.lat])
        .setPopup(popup)
        .addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  return (
    <section id="live-map" className="py-20 bg-white dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-8 text-gray-900 dark:text-white">
          Live Map Preview
        </h2>
        <div className="w-full h-[350px] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-neutral-800">
          {!token ? (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
              Set VITE_MAPBOX_TOKEN in client1/.env to view the map.
            </div>
          ) : (
            <div ref={mapContainerRef} className="w-full h-full" />
          )}
        </div>
      </div>
    </section>
  );
}
