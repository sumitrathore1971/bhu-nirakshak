import React, { useEffect, useState } from "react";
import constructionService from "../../services/constructionService.js";

export default function SiteInspections() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportById, setReportById] = useState({});
  const [photosById, setPhotosById] = useState({});

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await constructionService.listAll({ finalStatus: "Suspicious" });
      setRows(res.plans || []);
    } catch (e) {
      setError(e?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save(id) {
    try {
      const report = reportById[id] || "";
      const photos = photosById[id] || [];
      await constructionService.siteInspect(id, { report, status: "Completed", photos });
      await load();
    } catch (e) {
      alert(e?.message || "Failed to update");
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
                <th className="text-left px-3 py-2">Inspection ID</th>
                <th className="text-left px-3 py-2">Application ID</th>
                <th className="text-left px-3 py-2">Officer</th>
                <th className="text-left px-3 py-2">Report</th>
                <th className="text-left px-3 py-2">Photos</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t align-top">
                  <td className="px-3 py-2">{r._id.slice(-8)}</td>
                  <td className="px-3 py-2 font-medium">{r.applicationId}</td>
                  <td className="px-3 py-2">{r.siteInspection?.officer ? r.siteInspection.officer : "Unassigned"}</td>
                  <td className="px-3 py-2 w-72">
                    <textarea
                      className="w-full border rounded p-2"
                      rows={3}
                      placeholder="Enter inspection report..."
                      value={reportById[r._id] || ""}
                      onChange={(e) => setReportById((prev) => ({ ...prev, [r._id]: e.target.value }))}
                    />
                  </td>
                  <td className="px-3 py-2 w-56">
                    <input type="file" multiple onChange={(e) => setPhotosById((prev) => ({ ...prev, [r._id]: Array.from(e.target.files || []) }))} />
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => save(r._id)} className="px-3 py-1 rounded bg-black text-white">Save</button>
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


