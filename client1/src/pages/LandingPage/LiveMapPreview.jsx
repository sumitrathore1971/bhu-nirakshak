import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const markers = [
  { lat: 22.7196, lng: 75.8577, label: "Illegal Construction #1" },
  { lat: 22.725, lng: 75.85, label: "Illegal Construction #2" },
  { lat: 22.715, lng: 75.86, label: "Illegal Construction #3" },
];

export default function LiveMapPreview() {
  return (
    <section id="live-map" className="py-20 bg-white dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-8 text-gray-900 dark:text-white">
          Live Map Preview
        </h2>
        <div className="w-full h-[350px] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-neutral-800">
          <MapContainer center={[22.7196, 75.8577]} zoom={13} scrollWheelZoom={false} className="w-full h-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {markers.map((m, i) => (
              <Marker key={i} position={[m.lat, m.lng]}>
                <Popup>{m.label}</Popup>
              </Marker>
            ))}
            {/* Heatmap overlay can be added here if react-leaflet-heatmap-layer is installed */}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}