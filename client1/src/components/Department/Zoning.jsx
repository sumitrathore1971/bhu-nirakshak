import { Card, SectionHeader } from "./ui.jsx";
import { Map as MapIcon } from "lucide-react";
import MapboxMap from "./MapboxMap.jsx";

const zoning = [
  { code: "R1", use: "Residential Low Density", active: 84 },
  { code: "C2", use: "Commercial Mixed Use", active: 32 },
  { code: "I1", use: "Industrial", active: 11 },
];

export default function Zoning() {
  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-72px)]">
      <SectionHeader title="Zoning Map & Summary" icon={MapIcon} />
      <Card className="p-6 flex items-center justify-center h-64">
        <div className="w-full h-full">
          <MapboxMap height={220} />
        </div>
      </Card>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-secondary text-secondary-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">Zone Code</th>
                <th className="px-4 py-3">Land Use Type</th>
                <th className="px-4 py-3">No. of Active Constructions</th>
              </tr>
            </thead>
            <tbody>
              {zoning.map((z, idx) => (
                <tr key={z.code} className={idx % 2 === 0 ? "bg-background" : "bg-accent/30"}>
                  <td className="px-4 py-3 font-medium">{z.code}</td>
                  <td className="px-4 py-3">{z.use}</td>
                  <td className="px-4 py-3">{z.active}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


