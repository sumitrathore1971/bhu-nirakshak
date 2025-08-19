import React, { useEffect, useState } from "react";
import constructionService from "../../services/constructionService.js";
import { CheckCircle, AlertTriangle, XCircle, FileText } from "lucide-react";
import socketService from "../../services/socketService.js";
import { useAuth } from "../../context/AuthContext.jsx";

function StatusBadge({ status }) {
  const map = {
    Approved: { cls: "bg-green-100 text-green-700", Icon: CheckCircle },
    Suspicious: { cls: "bg-yellow-100 text-yellow-800", Icon: AlertTriangle },
    Rejected: { cls: "bg-red-100 text-red-700", Icon: XCircle },
    Pending: { cls: "bg-gray-100 text-gray-700", Icon: FileText },
  };
  const conf = map[status] || map.Pending;
  const I = conf.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${conf.cls}`}>
      <I size={14}/> {status}
    </span>
  );
}

export default function MyConstructionApplications() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const plans = await constructionService.myApplications();
        setRows(plans);
      } catch (e) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Live updates via sockets when admin/urban approves or rejects
  useEffect(() => {
    socketService.connect();
    if (user?._id) socketService.joinUserRoom(user._id);

    const handlePlanUpdate = async () => {
      try {
        const plans = await constructionService.myApplications();
        setRows(plans);
      } catch {}
    };

    // Listen to dedicated plan updates and fallback to report updates
    const cb1 = () => handlePlanUpdate();
    const cb2 = () => handlePlanUpdate();
    socketService.onConstructionPlanUpdated(cb1);
    socketService.onReportStatusUpdated(cb2);
    return () => {
      socketService.offConstructionPlanUpdated(cb1);
      socketService.offReportStatusUpdated(cb2);
      socketService.disconnect();
    };
  }, [user?._id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Application ID</th>
              <th className="text-left px-3 py-2">Date</th>
              <th className="text-left px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="px-3 py-2 font-medium">{r.applicationId}</td>
                <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2"><StatusBadge status={r.finalStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


