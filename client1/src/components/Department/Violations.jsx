import { Button } from "../ui/button.jsx";
import { Card, SectionHeader, StatusBadge } from "./ui.jsx";
import { AlertTriangle } from "lucide-react";

const violations = [
  { id: "V-1021", location: "Rajendra Nagar", type: "FAR", status: "Pending", officer: "A. Singh" },
  { id: "V-1043", location: "Palasia", type: "Height", status: "Action Taken", officer: "M. Khan" },
  { id: "V-1058", location: "Vijay Nagar", type: "Setback", status: "Closed", officer: "S. Patel" },
];

export default function Violations() {
  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-72px)]">
      <SectionHeader title="Reported Violations" icon={AlertTriangle} />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-secondary text-secondary-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned Officer</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((v, idx) => (
                <tr key={v.id} className={idx % 2 === 0 ? "bg-background" : "bg-accent/30"}>
                  <td className="px-4 py-3 font-medium">{v.id}</td>
                  <td className="px-4 py-3">{v.location}</td>
                  <td className="px-4 py-3">{v.type}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3">{v.officer}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm">View Case</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


