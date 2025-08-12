import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const pinIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({ onSelect }) {
  useMapEvents({ click(e) { onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }); } });
  return null;
}

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView([center.lat, center.lng], map.getZoom()); }, [center, map]);
  return null;
}

export default function MapSelector({ value, onChange }) {
  const [baseLayer, setBaseLayer] = useState('osm');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const center = useMemo(() => (
    value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : { lat: 22.7196, lng: 75.8577 }
  ), [value]);

  async function handleSearch(ev) {
    ev.preventDefault();
    if (!query.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
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
    onChange({ lat, lng });
    setResults([]);
  }

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
            <button type="button" onClick={() => setBaseLayer('osm')} className={`px-3 py-1 rounded ${baseLayer === 'osm' ? 'bg-gray-100' : ''}`}>Map</button>
            <button type="button" onClick={() => setBaseLayer('satellite')} className={`px-3 py-1 rounded ${baseLayer === 'satellite' ? 'bg-gray-100' : ''}`}>Satellite</button>
          </div>
        </div>
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="bg-white border rounded-md shadow max-h-56 overflow-auto">
              {results.map((r) => (
                <button key={`${r.place_id}`} type="button" onClick={() => handleSelectResult(r)} className="block w-full text-left px-3 py-2 hover:bg-gray-50">
                  {r.display_name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MapContainer center={[center.lat, center.lng]} zoom={13} className="w-full h-[420px] md:h-full rounded-lg overflow-hidden border border-gray-200">
        {baseLayer === 'osm' ? (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        ) : (
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
        )}
        <MapClickHandler onSelect={onChange} />
        <MapRecenter center={center} />
        {value?.lat && value?.lng && <Marker position={[value.lat, value.lng]} icon={pinIcon} />}
      </MapContainer>
    </div>
  );
}
