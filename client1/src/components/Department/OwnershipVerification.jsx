import React, { useEffect, useRef, useState } from "react";
import constructionService from "../../services/constructionService.js";
import { Button } from "../ui/button.jsx";
import { Check, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { getStaticBaseUrl } from "../../lib/utils.js";
import { Card, StatusBadge } from "./ui.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function OwnershipVerification() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All"); // All | Pending | Verified | Rejected
  const [viewerOpen, setViewerOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [plan, setPlan] = useState(null);
  const [actingId, setActingId] = useState(null);
  const { showFlashMessage } = useAuth();

  async function load() {
    setLoading(true);
    setError("");
    try {
      // Fetch all forwarded items (with any revenueVerification status)
      const res = await constructionService.listAll({ limit: 200 });
      let plans = (res.plans || []).filter((p) => !!p.revenueVerification && typeof p.revenueVerification === 'object');
      if (filter !== "All") {
        plans = plans.filter((p) => (p.revenueVerification?.status || "Pending") === filter);
      }
      // Newest first
      plans.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      setRows(plans);
    } catch (e) {
      setError(e?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  async function act(id, status) {
    try {
      setActingId(id);
      await constructionService.revenueVerify(id, { status });
      await load();
      showFlashMessage(
        status === "Verified" ? "Application verified." : "Application rejected.",
        "success"
      );
    } catch (e) {
      showFlashMessage(e?.message || "Failed to update", "error");
    }
    finally {
      setActingId(null);
    }
  }

  async function openViewer(id) {
    try {
      setLoadingPlan(true);
      const p = await constructionService.getById(id);
      setPlan(p);
      setViewerOpen(true);
    } catch (e) {
      showFlashMessage(e?.message || "Failed to load plan", "error");
    } finally {
      setLoadingPlan(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {["All", "Pending", "Verified", "Rejected"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "secondary" : "outline"}
            size="sm"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>
      {loading ? (
        <Card className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-1/3" />
            <div className="h-10 bg-gray-100 dark:bg-neutral-900 rounded" />
            <div className="h-10 bg-gray-100 dark:bg-neutral-900 rounded" />
            <div className="h-10 bg-gray-100 dark:bg-neutral-900 rounded" />
          </div>
        </Card>
      ) : error ? (
        <Card className="p-4">
          <div className="text-red-600 text-sm">{error}</div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-neutral-900/40">
                <tr className="text-left">
                  <th className="px-3 py-2">Application ID</th>
                  <th className="px-3 py-2">Applicant</th>
                  <th className="px-3 py-2">Revenue Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const status = r.revenueVerification?.status || "Pending";
                  const isVerified = status === "Verified";
                  return (
                    <tr key={r._id} className="border-t dark:border-neutral-800 odd:bg-gray-50/50 dark:odd:bg-neutral-900/30">
                      <td className="px-3 py-2 font-medium">{r.applicationId}</td>
                      <td className="px-3 py-2">{r.applicant?.name || "-"}</td>
                      <td className="px-3 py-2"><StatusBadge status={status} /></td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {!isVerified && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => act(r._id, "Verified")}
                                aria-label="Verify application"
                                disabled={actingId === r._id}
                              >
                                <Check className="h-4 w-4" /> Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => act(r._id, "Rejected")}
                                aria-label="Reject application"
                                disabled={actingId === r._id}
                              >
                                <X className="h-4 w-4" /> Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewer(r._id)}
                            aria-label="View plan"
                          >
                            <Eye className="h-4 w-4" /> View Plan
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {viewerOpen && (
        <PlanViewer plan={plan} loading={loadingPlan} onClose={() => setViewerOpen(false)} />
      )}
    </div>
  );
}

function DocImage({ label, url, showLabel = true }) {
  const isImage = (u) => /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(u || "");
  if (!url) {
    return (
      <div className="text-xs text-gray-500">{showLabel && (<><span>{label}: </span></>)}<span className="text-gray-400">Not provided</span></div>
    );
  }
  const base = getStaticBaseUrl();
  const src = url.startsWith("http") ? url : `${base}${url.startsWith("/") ? url : `/${url}`}`;
  if (isImage(url)) {
    return (
      <div>
        {showLabel && <div className="text-xs text-gray-500 mb-1">{label}</div>}
        <img src={src} alt={label} className="w-full max-h-48 object-contain rounded border" />
      </div>
    );
  }
  return (
    <div>
      {showLabel && <div className="text-xs text-gray-500 mb-1">{label}</div>}
      <div className="text-xs text-gray-500">Preview not available.</div>
    </div>
  );
}

function DocumentSection({ documents }) {
  const items = [
    { label: "Site Plan", url: documents?.sitePlan },
    { label: "Ownership Docs", url: documents?.ownershipDocs },
    { label: "Architect Plan", url: documents?.architectPlan },
  ].filter((d) => !!d.url);

  const [idx, setIdx] = useState(0);
  const hasItems = items.length > 0;
  const current = hasItems ? items[idx] : null;

  const next = () => setIdx((i) => (i + 1) % items.length);
  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);

  return (
    <div className="pt-2">
      <div className="text-xs text-gray-500 mb-2">Documents</div>
      {!hasItems ? (
        <div className="text-xs text-gray-500">No documents uploaded</div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{current.label}</span>
            <span>
              {idx + 1} / {items.length}
            </span>
          </div>
          <div className="relative">
            <DocImage label={current.label} url={current.url} showLabel={false} />
            {items.length > 1 && (
              <>
                <button type="button" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 shadow hover:bg-white">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 shadow hover:bg-white">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {items.length > 1 && (
            <div className="flex items-center justify-center gap-1 pt-1">
              {items.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? "bg-gray-800" : "bg-gray-300"}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MapboxPreview({ polygon }) {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!polygon || polygon.type !== "Polygon" || !Array.isArray(polygon.coordinates)) return;
    if (!token) return;

    if (mapRef.current) {
      try { mapRef.current.remove(); } catch {}
      mapRef.current = null;
    }

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [75.8577, 22.7196],
      zoom: 11,
    });
    mapRef.current = map;
    map.on("load", () => {
      const sourceId = "plan-geom";
      const layerFill = "plan-geom-fill";
      const layerLine = "plan-geom-line";
      const feature = { type: "Feature", geometry: polygon, properties: {} };
      map.addSource(sourceId, { type: "geojson", data: feature });
      map.addLayer({ id: layerFill, type: "fill", source: sourceId, paint: { "fill-color": "#10b981", "fill-opacity": 0.25 } });
      map.addLayer({ id: layerLine, type: "line", source: sourceId, paint: { "line-color": "#10b981", "line-width": 2 } });
      try {
        const bounds = new mapboxgl.LngLatBounds();
        const ring = polygon.coordinates?.[0] || [];
        ring.forEach((c) => bounds.extend(c));
        if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 30, duration: 500 });
      } catch {}
    });
    return () => {
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
      }
    };
  }, [polygon, token]);

  if (!polygon || polygon.type !== "Polygon") {
    return <div className="h-full grid place-items-center text-sm text-gray-500">No polygon found</div>;
  }
  if (!token) {
    return <div className="h-full grid place-items-center text-sm text-gray-500 p-4">Set VITE_MAPBOX_TOKEN to view polygon map.</div>;
  }
  return <div ref={containerRef} className="w-full h-full" />;
}

function PlanViewer({ plan, loading, onClose }) {
  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-4xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
          <h3 className="font-semibold">Construction Plan</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-4 space-y-3 border-r border-gray-200 dark:border-neutral-800 min-h-[360px]">
            {loading ? (
              <div className="text-sm">Loading plan...</div>
            ) : !plan ? (
              <div className="text-sm text-gray-600">No data</div>
            ) : (
              <>
                <div>
                  <div className="text-xs text-gray-500">Application ID</div>
                  <div className="font-medium">{plan.applicationId}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Applicant</div>
                  <div className="font-medium">{plan.applicant?.name || "-"}</div>
                </div>
                <DocumentSection documents={plan.documents} />
              </>
            )}
          </div>
          <div className="min-h-[360px]"><MapboxPreview polygon={plan?.plotCoordinates} /></div>
        </div>
      </div>
    </div>
  );
}


