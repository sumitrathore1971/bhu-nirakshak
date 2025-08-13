// Utility to fetch and add Indore boundary GeoJSON to a Mapbox GL map

let cachedBoundaryGeoJSON = null;

function resolveBoundaryUrl() {
  const explicit = import.meta.env.VITE_BOUNDARIES_URL;
  if (explicit) return explicit;
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
  // Prefer hitting the API base to avoid CORS/port issues
  return `${apiBase.replace(/\/$/, "")}/boundaries`;
}

export async function fetchBoundaryGeoJSON() {
  if (cachedBoundaryGeoJSON) return cachedBoundaryGeoJSON;
  const url = resolveBoundaryUrl();
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch boundaries: ${res.status}`);
  const data = await res.json();
  cachedBoundaryGeoJSON = data;
  return data;
}

export const BOUNDARY_SOURCE_ID = "indore-boundary";
export const BOUNDARY_FILL_LAYER_ID = "indore-boundary-fill";
export const BOUNDARY_LINE_LAYER_ID = "indore-boundary-outline";

export async function addBoundaryToMap(map, options = {}) {
  const { zoomThreshold = 13 } = options;
  const data = await fetchBoundaryGeoJSON();
  const existing = map.getSource(BOUNDARY_SOURCE_ID);
  if (existing) {
    existing.setData(data);
    return;
  }

  map.addSource(BOUNDARY_SOURCE_ID, { type: "geojson", data });

  // Filled polygon (visible until zoomThreshold)
  map.addLayer({
    id: BOUNDARY_FILL_LAYER_ID,
    type: "fill",
    source: BOUNDARY_SOURCE_ID,
    maxzoom: zoomThreshold,
    paint: {
      "fill-color": "#3b82f6",
      "fill-opacity": 0.08,
    },
  });

  // Outline (visible until zoomThreshold)
  map.addLayer({
    id: BOUNDARY_LINE_LAYER_ID,
    type: "line",
    source: BOUNDARY_SOURCE_ID,
    maxzoom: zoomThreshold,
    paint: {
      "line-color": "#1d4ed8",
      "line-width": 2,
      "line-opacity": 0.6,
    },
  });
}
