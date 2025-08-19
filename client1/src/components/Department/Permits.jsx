import { Button } from "../ui/button.jsx";
import { Card, SectionHeader, StatusBadge } from "./ui.jsx";
import { FileCheck, Check, X } from "lucide-react";

const permits = [
  { id: "P-2025-0012", applicant: "Ravi Sharma", address: "12, MG Road, Indore", status: "Pending", date: "2025-08-15" },
  { id: "P-2025-0099", applicant: "Neha Verma", address: "45, Vijay Nagar", status: "Approved", date: "2025-08-03" },
  { id: "P-2025-0042", applicant: "Om Construction", address: "Scheme 78", status: "Rejected", date: "2025-07-28" },
];

export default function Permits() {
  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-72px)]">
      <SectionHeader title="Permit Applications" icon={FileCheck} />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-secondary text-secondary-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">Permit ID</th>
                <th className="px-4 py-3">Applicant Name</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {permits.map((p, idx) => (
                <tr key={p.id} className={idx % 2 === 0 ? "bg-background" : "bg-accent/30"}>
                  <td className="px-4 py-3 font-medium">{p.id}</td>
                  <td className="px-4 py-3">{p.applicant}</td>
                  <td className="px-4 py-3">{p.address}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">{p.date}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="outline" size="sm">View Details</Button>
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


