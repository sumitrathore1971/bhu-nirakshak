import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button.jsx";
import { Card, SectionHeader } from "./ui.jsx";
import {
  FileCheck,
  Check,
  X,
  AlertTriangle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import constructionService from "../../services/constructionService.js";
import { getStaticBaseUrl } from "../../lib/utils.js";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function StatusPill({ status }) {
  const map = {
    Pending: "bg-gray-100 text-gray-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Suspicious: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        map[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}

export default function Permits() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All"); // All | Pending | Approved | Rejected | Suspicious
  const [flash, setFlash] = useState(null); // { message, type: 'success'|'error' }
  const [viewerOpen, setViewerOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [plan, setPlan] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = { limit: 50 };
      if (filter !== "All") params.finalStatus = filter;
      const res = await constructionService.listAll(params);
      setRows(res.plans || []);
    } catch (e) {
      setError(e?.message || "Failed to fetch permits");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function act(id, status) {
    try {
      await constructionService.urbanVerify(id, { status });
      await load();
    } catch (e) {
      alert(e?.message || "Failed to update");
    }
  }

  async function flag(id) {
    try {
      await constructionService.flagSuspicious(id, "Flagged from Permits tab");
      await load();
    } catch (e) {
      alert(e?.message || "Failed to flag");
    }
  }

  async function openViewer(id) {
    try {
      setLoadingPlan(true);
      const p = await constructionService.getById(id);
      setPlan(p);
      setViewerOpen(true);
    } catch (e) {
      alert(e?.message || "Failed to load plan");
    } finally {
      setLoadingPlan(false);
    }
  }

  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-72px)]">
      <SectionHeader title="Permit Applications" icon={FileCheck} />
      {flash?.message && (
        <div
          className={`px-4 py-2 rounded border text-sm ${
            flash.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {flash.message}
        </div>
      )}
      <div className="flex items-center gap-2">
        {["All", "Pending", "Approved", "Suspicious", "Rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded border text-sm ${
              filter === f ? "bg-black text-white" : "bg-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm">Loading...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-secondary text-secondary-foreground">
                <tr className="text-left">
                  <th className="px-4 py-3">Application ID</th>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Urban Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p, idx) => (
                  <tr
                    key={p._id}
                    className={idx % 2 === 0 ? "bg-background" : "bg-accent/30"}
                  >
                    <td className="px-4 py-3 font-medium">{p.applicationId}</td>
                    <td className="px-4 py-3">{p.applicant?.name || "-"}</td>
                    <td className="px-4 py-3">
                      <StatusPill
                        status={p.urbanVerification?.status || "Pending"}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={async () => {
                          try {
                            await constructionService.forwardToRevenue(p._id);
                            setFlash({
                              message: `Application ${p.applicationId} forwarded to Revenue for ownership verification.`,
                              type: "success",
                            });
                            setTimeout(() => setFlash(null), 3000);
                            await load();
                          } catch (e) {
                            setFlash({
                              message:
                                e?.message || "Failed to forward to Revenue",
                              type: "error",
                            });
                            setTimeout(() => setFlash(null), 3500);
                          }
                        }}
                      >
                        Assign to Revenue
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => openViewer(p._id)}
                      >
                        <Eye className="h-4 w-4" />
                        View Plan
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1"
                        onClick={() => act(p._id, "Approved")}
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1"
                        onClick={() => act(p._id, "Rejected")}
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => flag(p._id)}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Flag
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {viewerOpen && (
        <PlanViewer
          plan={plan}
          loading={loadingPlan}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}

function PlanViewer({ plan, loading, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-4xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
          <h3 className="font-semibold">Construction Plan</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
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
                  <div className="font-medium">
                    {plan.applicant?.name || "-"}
                  </div>
                </div>
                <DocumentSection documents={plan.documents} />
              </>
            )}
          </div>
          <div className="min-h-[360px]">
            <MapboxPreview polygon={plan?.plotCoordinates} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DocImage({ label, url, showLabel = true }) {
  const isImage = (u) =>
    /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(u || "");
  if (!url) {
    return (
      <div className="text-xs text-gray-500">
        {showLabel && (
          <>
            <span>{label}: </span>
          </>
        )}
        <span className="text-gray-400">Not provided</span>
      </div>
    );
  }
  const base = getStaticBaseUrl();
  const src = url.startsWith("http")
    ? url
    : `${base}${url.startsWith("/") ? url : `/${url}`}`;
  if (isImage(url)) {
    return (
      <div>
        {showLabel && <div className="text-xs text-gray-500 mb-1">{label}</div>}
        <img
          src={src}
          alt={label}
          className="w-full max-h-48 object-contain rounded border"
        />
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
            <DocImage
              label={current.label}
              url={current.url}
              showLabel={false}
            />
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 shadow hover:bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 shadow hover:bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {items.length > 1 && (
            <div className="flex items-center justify-center gap-1 pt-1">
              {items.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i === idx ? "bg-gray-800" : "bg-gray-300"
                  }`}
                />
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
    if (
      !polygon ||
      polygon.type !== "Polygon" ||
      !Array.isArray(polygon.coordinates)
    )
      return;
    if (!token) return; // token required

    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch {}
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
      map.addLayer({
        id: layerFill,
        type: "fill",
        source: sourceId,
        paint: { "fill-color": "#10b981", "fill-opacity": 0.25 },
      });
      map.addLayer({
        id: layerLine,
        type: "line",
        source: sourceId,
        paint: { "line-color": "#10b981", "line-width": 2 },
      });
      try {
        const bounds = new mapboxgl.LngLatBounds();
        const ring = polygon.coordinates?.[0] || [];
        ring.forEach((c) => bounds.extend(c));
        if (!bounds.isEmpty())
          map.fitBounds(bounds, { padding: 30, duration: 500 });
      } catch {}
    });
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }
    };
  }, [polygon, token]);

  if (!polygon || polygon.type !== "Polygon") {
    return (
      <div className="h-full grid place-items-center text-sm text-gray-500">
        No polygon found
      </div>
    );
  }
  if (!token) {
    return (
      <div className="h-full grid place-items-center text-sm text-gray-500 p-4">
        Set VITE_MAPBOX_TOKEN to view polygon map.
      </div>
    );
  }
  return <div ref={containerRef} className="w-full h-full" />;
}
