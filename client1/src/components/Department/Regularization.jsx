import { Button } from "../ui/button.jsx";
import { Card, SectionHeader, StatusBadge } from "./ui.jsx";
import { FileCheck, Check, X } from "lucide-react";

const regularization = [
  { id: "REG-3001", owner: "Anita Desai", address: "LIG Colony", type: "Setback", status: "Pending" },
  { id: "REG-3008", owner: "Suresh Kumar", address: "Tilak Nagar", type: "FAR", status: "Approved" },
  { id: "REG-3012", owner: "Green Homes", address: "New Palasia", type: "Height", status: "Rejected" },
];

export default function Regularization() {
  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-72px)]">
      <SectionHeader title="Regularization Applications" icon={FileCheck} />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-secondary text-secondary-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">Application ID</th>
                <th className="px-4 py-3">Owner Name</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Violation Type</th>
                <th className="px-4 py-3">Application Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {regularization.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 0 ? "bg-background" : "bg-accent/30"}>
                  <td className="px-4 py-3 font-medium">{r.id}</td>
                  <td className="px-4 py-3">{r.owner}</td>
                  <td className="px-4 py-3">{r.address}</td>
                  <td className="px-4 py-3">{r.type}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="outline" size="sm">Review</Button>
                    <Button variant="secondary" size="sm" className="gap-1"><Check className="h-4 w-4" />Approve</Button>
                    <Button variant="destructive" size="sm" className="gap-1"><X className="h-4 w-4" />Reject</Button>
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


