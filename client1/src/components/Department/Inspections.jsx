import { Card, SectionHeader, StatusBadge } from "./ui.jsx";
import { ClipboardCheck } from "lucide-react";

const inspections = [
  { id: "INSP-7001", site: "Scheme 54", officer: "R. Gupta", date: "2025-08-21", status: "Scheduled" },
  { id: "INSP-7008", site: "Bhawarkuan", officer: "K. Jain", date: "2025-08-18", status: "Completed" },
  { id: "INSP-7010", site: "MR-10", officer: "T. Mehta", date: "2025-08-17", status: "Delayed" },
];

export default function Inspections() {
  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-72px)]">
      <SectionHeader title="Inspection Schedule" icon={ClipboardCheck} />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-secondary text-secondary-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">Inspection ID</th>
                <th className="px-4 py-3">Site Location</th>
                <th className="px-4 py-3">Officer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((i, idx) => (
                <tr key={i.id} className={idx % 2 === 0 ? "bg-background" : "bg-accent/30"}>
                  <td className="px-4 py-3 font-medium">{i.id}</td>
                  <td className="px-4 py-3">{i.site}</td>
                  <td className="px-4 py-3">{i.officer}</td>
                  <td className="px-4 py-3">{i.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


