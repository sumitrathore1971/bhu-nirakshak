import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Card, SectionHeader } from "./ui.jsx";
import OwnershipVerificationTable from "./OwnershipVerification.jsx";
import constructionService from "../../services/constructionService.js";
import {
  Menu,
  LogOut,
  User,
  FileText,
  Landmark,
  Banknote,
  AlertOctagon,
  Map as MapIcon,
  Check,
  X,
  Eye
} from "lucide-react";

function Topbar({ isCollapsed, setIsCollapsed }) {
  const { logout } = useAuth();
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-neutral-950 shadow-lg border-b border-gray-200 dark:border-neutral-800 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Revenue Department</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ownership, taxation & land-use conversion</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-input bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
            <span className="text-sm">Dept. Officer</span>
          </div>
          <Button variant="destructive" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}

function Sidebar({ isCollapsed, setIsCollapsed, activeTab, setActiveTab }) {
  const menuItems = [
    { id: "Overview", label: "Overview", icon: Landmark },
    { id: "Ownership Verification", label: "Ownership Verification", icon: FileText },
    { id: "Tax Records", label: "Tax Records", icon: Banknote },
    { id: "Disputes", label: "Disputes", icon: AlertOctagon },
    { id: "Land Conversion", label: "Land Conversion", icon: Landmark },
    { id: "Survey Data", label: "Survey Data", icon: MapIcon }
  ];
  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="flex min-h-screen bg-white dark:bg-neutral-950 border-r border-gray-200 dark:border-neutral-800 shadow-lg"
    >
      <div className="flex flex-col h-full w-full">
        <div className="p-5 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md overflow-hidden">
                <img src="/assets/logo.png" alt="logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-heading font-bold text-base">Bhu-Nirakshak</span>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </motion.div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
            {isCollapsed ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            )}
          </button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-neutral-800 text-center text-sm text-muted-foreground">
            Revenue Dashboard
          </div>
        )}
      </div>
    </motion.aside>
  );
}

function RevenueStatusBadge({ status }) {
  const map = {
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    Verified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    Approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    Active: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    Resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Disputed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    Clear: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"}`}>
      {status}
    </span>
  );
}

function OverviewPanel() {
  const stats = [
    { label: "Ownership Verifications Pending", value: 48, icon: FileText },
    { label: "Active Tax Defaulters", value: 76, icon: Banknote },
    { label: "Disputed Lands", value: 19, icon: AlertOctagon },
    { label: "Land Conversion Applications", value: 27, icon: Landmark }
  ];
  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-72px)]">
      <Card className="p-5">
        <SectionHeader title="Mission Statement" icon={Landmark} />
        <p className="text-sm md:text-base text-muted-foreground">
          The Revenue Department manages land ownership, taxation, and land-use conversion, ensuring legal and transparent property development.
        </p>
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

function OwnershipVerification() {
  const requests = [
    { id: "OV-2025-0012", owner: "Ravi Sharma", surveyNo: "SR-109/2", address: "12, MG Road, Indore", status: "Pending", date: "2025-08-08" },
    { id: "OV-2025-0043", owner: "Neha Verma", surveyNo: "SR-210/7", address: "45, Vijay Nagar", status: "Verified", date: "2025-08-06" },
    { id: "OV-2025-0021", owner: "Om Builders", surveyNo: "SR-045/1", address: "Scheme 78", status: "Rejected", date: "2025-08-01" }
  ];
  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-72px)]">
      <SectionHeader title="Ownership Verification Requests" icon={FileText} />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-secondary text-secondary-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Owner Name</th>
                <th className="px-4 py-3">Survey No.</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 0 ? "bg-background" : "bg-accent/30"}>
                  <td className="px-4 py-3 font-medium">{r.id}</td>
                  <td className="px-4 py-3">{r.owner}</td>
                  <td className="px-4 py-3">{r.surveyNo}</td>
                  <td className="px-4 py-3">{r.address}</td>
                  <td className="px-4 py-3"><RevenueStatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="secondary" size="sm" className="gap-1"><Check className="h-4 w-4" />Verify</Button>
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

function TaxRecords() {
  const records = [
    { id: "PR-10012", owner: "Ravi Sharma", taxDue: 12000, lastPaymentDate: "2025-07-10", status: "Pending" },
    { id: "PR-10056", owner: "Neha Verma", taxDue: 0, lastPaymentDate: "2025-08-01", status: "Paid" },
    { id: "PR-10101", owner: "Om Builders", taxDue: 54000, lastPaymentDate: "2025-05-22", status: "Pending" }
  ];
  const currency = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-72px)]">
      <SectionHeader title="Tax Records" icon={Banknote} />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-secondary text-secondary-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">Property ID</th>
                <th className="px-4 py-3">Owner Name</th>
                <th className="px-4 py-3">Tax Due</th>
                <th className="px-4 py-3">Last Payment Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 0 ? "bg-background" : "bg-accent/30"}>
                  <td className="px-4 py-3 font-medium">{r.id}</td>
                  <td className="px-4 py-3">{r.owner}</td>
                  <td className={`px-4 py-3 ${r.taxDue > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{currency(r.taxDue)}</td>
                  <td className="px-4 py-3">{r.lastPaymentDate}</td>
                  <td className="px-4 py-3"><RevenueStatusBadge status={r.status === "Pending" && r.taxDue > 0 ? "Overdue" : r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Disputes() {
  const disputes = [
    { id: "D-3001", surveyNo: "SR-109/2", parties: "Ravi Sharma vs M. Singh", type: "Ownership", status: "Active" },
    { id: "D-3002", surveyNo: "SR-210/7", parties: "Neha Verma vs City", type: "Boundary", status: "Resolved" },
    { id: "D-3003", surveyNo: "SR-045/1", parties: "Om Builders vs RWA", type: "Ownership", status: "Active" }
  ];
  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-72px)]">
      <SectionHeader title="Land Disputes" icon={AlertOctagon} />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-secondary text-secondary-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">Dispute ID</th>
                <th className="px-4 py-3">Survey No.</th>
                <th className="px-4 py-3">Parties Involved</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d, idx) => (
                <tr key={d.id} className={idx % 2 === 0 ? "bg-background" : "bg-accent/30"}>
                  <td className="px-4 py-3 font-medium">{d.id}</td>
                  <td className="px-4 py-3">{d.surveyNo}</td>
                  <td className="px-4 py-3">{d.parties}</td>
                  <td className="px-4 py-3">{d.type}</td>
                  <td className="px-4 py-3"><RevenueStatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" className="gap-1"><Eye className="h-4 w-4" />View Details</Button>
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

function LandConversion() {
  const applications = [
    { id: "LC-5001", owner: "Ravi Sharma", currentUse: "Residential", requestedUse: "Commercial", status: "Pending" },
    { id: "LC-5002", owner: "Neha Verma", currentUse: "Agricultural", requestedUse: "Residential", status: "Approved" },
    { id: "LC-5003", owner: "Om Builders", currentUse: "Industrial", requestedUse: "Mixed Use", status: "Rejected" }
  ];
  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-72px)]">
      <SectionHeader title="Land Conversion Applications" icon={Landmark} />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-secondary text-secondary-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">Application ID</th>
                <th className="px-4 py-3">Owner Name</th>
                <th className="px-4 py-3">Current Use</th>
                <th className="px-4 py-3">Requested Use</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a, idx) => (
                <tr key={a.id} className={idx % 2 === 0 ? "bg-background" : "bg-accent/30"}>
                  <td className="px-4 py-3 font-medium">{a.id}</td>
                  <td className="px-4 py-3">{a.owner}</td>
                  <td className="px-4 py-3">{a.currentUse}</td>
                  <td className="px-4 py-3">{a.requestedUse}</td>
                  <td className="px-4 py-3"><RevenueStatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="outline" size="sm">Review</Button>
                    {a.status === "Pending" && (
                      <>
                        <Button variant="secondary" size="sm" className="gap-1"><Check className="h-4 w-4" />Approve</Button>
                        <Button variant="destructive" size="sm" className="gap-1"><X className="h-4 w-4" />Reject</Button>
                      </>
                    )}
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

function SurveyData() {
  const rows = [
    { surveyNo: "SR-109/2", location: "Rajendra Nagar", area: 450, boundary: "Clear" },
    { surveyNo: "SR-210/7", location: "Vijay Nagar", area: 780, boundary: "Disputed" },
    { surveyNo: "SR-045/1", location: "Scheme 78", area: 620, boundary: "Clear" }
  ];
  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-72px)]">
      <SectionHeader title="Survey Data" icon={MapIcon} />
      <Card className="p-6">
        <div className="w-full h-56 rounded-xl border border-dashed border-gray-300 dark:border-neutral-800 flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
          <div className="text-center">
            <MapIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Survey Settlement Map Integration Coming Soon</p>
          </div>
        </div>
      </Card>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-secondary text-secondary-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">Survey No.</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Area (sq.m)</th>
                <th className="px-4 py-3">Boundary Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.surveyNo} className={idx % 2 === 0 ? "bg-background" : "bg-accent/30"}>
                  <td className="px-4 py-3 font-medium">{r.surveyNo}</td>
                  <td className="px-4 py-3">{r.location}</td>
                  <td className="px-4 py-3">{r.area}</td>
                  <td className="px-4 py-3"><RevenueStatusBadge status={r.boundary} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function RevenueDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  const renderTab = () => {
    switch (activeTab) {
      case "Overview":
        return <OverviewPanel />;
      case "Ownership Verification":
        return <OwnershipVerificationTable />;
      case "Tax Records":
        return <TaxRecords />;
      case "Disputes":
        return <Disputes />;
      case "Land Conversion":
        return <LandConversion />;
      case "Survey Data":
        return <SurveyData />;
      default:
        return <OverviewPanel />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-neutral-950">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="flex-1 flex flex-col">
        <Topbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}


