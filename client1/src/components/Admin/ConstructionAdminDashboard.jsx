import React, { useEffect, useMemo, useState } from "react";
import constructionService from "../../services/constructionService.js";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

function Marker({ status }) {
  const color = status === "Approved" ? "bg-green-500" : status === "Suspicious" ? "bg-yellow-500" : status === "Rejected" ? "bg-red-500" : "bg-gray-400";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />;
}

export default function ConstructionAdminDashboard() {
  const [data, setData] = useState({ plans: [], total: 0 });
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await constructionService.listAll({ finalStatus: filter });
        setData({ plans: res.plans || [], total: res.total || 0 });
      } catch (e) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {[
          { key: "Pending", label: "Pending" },
          { key: "Approved", label: "Approved" },
          { key: "Suspicious", label: "Suspicious" },
          { key: "Rejected", label: "Rejected" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded border ${filter === f.key ? "bg-black text-white" : "bg-white"}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Application ID</th>
                  <th className="text-left px-3 py-2">Applicant</th>
                  <th className="text-left px-3 py-2">Final Status</th>
                  <th className="text-left px-3 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {data.plans.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="px-3 py-2 font-medium">{p.applicationId}</td>
                    <td className="px-3 py-2">{p.applicant?.name || "-"}</td>
                    <td className="px-3 py-2 flex items-center gap-2"><Marker status={p.finalStatus} /> {p.finalStatus}</td>
                    <td className="px-3 py-2">{new Date(p.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border rounded-lg p-3">
            <div className="h-[420px] flex items-center justify-center text-gray-500 text-sm">
              GIS Map View placeholder. Integrate polygons on Mapbox with color coding.
            </div>
            <div className="text-xs text-gray-500 mt-2">Legend: Approved = green, Suspicious = yellow, Rejected = red</div>
          </div>
        </div>
      )}
    </div>
  );
}


