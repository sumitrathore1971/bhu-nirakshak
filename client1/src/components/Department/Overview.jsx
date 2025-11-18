import { FileCheck, ClipboardCheck, AlertTriangle, Map as MapIcon, LayoutDashboard } from "lucide-react";
import { Card, SectionHeader } from "./ui.jsx";
import MapboxMap from "./MapboxMap.jsx";

const stats = [
  { label: "Active Permits", value: 128, icon: FileCheck },
  { label: "Pending Approvals", value: 37, icon: ClipboardCheck },
  { label: "Violations Reported", value: 56, icon: AlertTriangle },
  { label: "Inspections Scheduled", value: 22, icon: MapIcon },
];

export default function Overview() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-72px)]">
      <Card className="p-5">
        <SectionHeader title="Mission Statement" icon={LayoutDashboard} />
        <p className="text-sm md:text-base text-muted-foreground">
          The Urban Development Department ensures construction compliance with Indore’s master plan, zoning laws, and development regulations.
        </p>
      </Card>
      <Card className="p-0">
        <MapboxMap height={320} />
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-semibold mt-1">{s.value}</p>
              </div>
              <div className="p-3 rounded-xl bg-accent text-accent-foreground dark:bg-accent/50">
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


