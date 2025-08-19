import React, { useEffect, useState } from "react";
import constructionService from "../../services/constructionService.js";

export default function PlanScrutiny() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await constructionService.listAll({ finalStatus: "Pending" });
      setRows(res.plans || []);
    } catch (e) {
      setError(e?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function act(id, status) {
    try {
      await constructionService.urbanVerify(id, { status });
      // Do not remove rejected items; simply refresh with current filter (Pending by default here)
      await load();
    } catch (e) {
      alert(e?.message || "Failed to update");
    }
  }

  async function flag(id) {
    try {
      await constructionService.flagSuspicious(id, "Auto-flagged by Urban Development");
      await load();
    } catch (e) {
      alert(e?.message || "Failed to flag");
    }
  }

  return (
    <div className="space-y-3">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Application ID</th>
                <th className="text-left px-3 py-2">FAR</th>
                <th className="text-left px-3 py-2">Zoning</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="px-3 py-2 font-medium">{r.applicationId}</td>
                  <td className="px-3 py-2">Compliant</td>
                  <td className="px-3 py-2">Permissible</td>
                  <td className="px-3 py-2">{r.urbanVerification?.status || "Pending"}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button onClick={() => act(r._id, "Approved")} className="px-2 py-1 text-xs rounded bg-green-600 text-white">Approve</button>
                    <button onClick={() => act(r._id, "Rejected")} className="px-2 py-1 text-xs rounded bg-red-600 text-white">Reject</button>
                    <button onClick={() => flag(r._id)} className="px-2 py-1 text-xs rounded bg-yellow-500 text-white">Flag Suspicious</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


