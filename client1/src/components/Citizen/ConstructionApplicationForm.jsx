import React, { useState } from "react";
import MapSelector from "./MapSelector.jsx";
import constructionService from "../../services/constructionService.js";
import { motion } from "framer-motion";
import { FileText, CheckCircle, AlertTriangle, X, Upload } from "lucide-react";

export default function ConstructionApplicationForm({ onSubmitted }) {
  const [polygon, setPolygon] = useState(null);
  const [files, setFiles] = useState({ sitePlan: null, ownershipDocs: null, architectPlan: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleFile = (key) => (e) => setFiles((prev) => ({ ...prev, [key]: e.target.files?.[0] || null }));
  const clearFile = (key) => () => setFiles((prev) => ({ ...prev, [key]: null }));

  async function submitForm(e) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    if (!polygon) return setError("Please draw the plot polygon on the map.");
    setSubmitting(true);
    try {
      const plan = await constructionService.apply({ polygon, files });
      setSuccess(plan);
      onSubmitted && onSubmitted(plan);
    } catch (err) {
      setError(err?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-4">
        {/* Documents */}
        <div className="p-4 md:p-5 border rounded-xl bg-white dark:bg-neutral-900">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText size={18}/> Application Documents</h3>
          <p className="text-xs text-gray-500 mb-3">Accepted: PDF, JPG, PNG. Max 15MB each.</p>
          <div className="space-y-4">
            {/* Site Plan */}
            <div>
              <label className="block text-sm font-medium mb-1">Site Plan</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm hover:bg-gray-50 dark:hover:bg-neutral-800">
                  <Upload size={16} /> Upload
                  <input type="file" accept="image/*,application/pdf" onChange={handleFile("sitePlan")} className="hidden" />
                </label>
                {files.sitePlan && (
                  <span className="inline-flex items-center gap-2 text-xs bg-gray-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full">
                    {files.sitePlan.name}
                    <button type="button" onClick={clearFile("sitePlan")} className="hover:text-red-600"><X size={14}/></button>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Upload the latest sanctioned site plan or draft.</p>
            </div>
            {/* Ownership Documents */}
            <div>
              <label className="block text-sm font-medium mb-1">Ownership Documents</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm hover:bg-gray-50 dark:hover:bg-neutral-800">
                  <Upload size={16} /> Upload
                  <input type="file" accept="image/*,application/pdf" onChange={handleFile("ownershipDocs")} className="hidden" />
                </label>
                {files.ownershipDocs && (
                  <span className="inline-flex items-center gap-2 text-xs bg-gray-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full">
                    {files.ownershipDocs.name}
                    <button type="button" onClick={clearFile("ownershipDocs")} className="hover:text-red-600"><X size={14}/></button>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Sale deed, mutation, or any valid proof of ownership.</p>
            </div>
            {/* Architect Plan */}
            <div>
              <label className="block text-sm font-medium mb-1">Architect Plan</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm hover:bg-gray-50 dark:hover:bg-neutral-800">
                  <Upload size={16} /> Upload
                  <input type="file" accept="image/*,application/pdf" onChange={handleFile("architectPlan")} className="hidden" />
                </label>
                {files.architectPlan && (
                  <span className="inline-flex items-center gap-2 text-xs bg-gray-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full">
                    {files.architectPlan.name}
                    <button type="button" onClick={clearFile("architectPlan")} className="hover:text-red-600"><X size={14}/></button>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Architectural drawings (floor plans/elevations).</p>
            </div>
          </div>
        </div>
        {/* Map */}
        <div className="p-4 md:p-5 border rounded-xl bg-white dark:bg-neutral-900 h-full">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText size={18}/> Plot Coordinates <span className="text-xs font-normal text-gray-500">(required)</span></h3>
          <div className="h-[420px] md:h-[480px]">
            <MapSelector onPolygonChange={setPolygon} />
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-2"><AlertTriangle size={14}/> Draw a closed polygon covering your plot area.</div>
        </div>
      </motion.div>
      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>
      )}
      {success && (
        <div className="p-3 text-sm bg-green-50 text-green-700 border border-green-200 rounded flex items-center gap-2">
          <CheckCircle size={16}/> Submitted. Application ID: <span className="font-semibold">{success.applicationId}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-gray-500">Application ID will be generated on submit.</div>
        <div className="flex items-center gap-2">
          <button onClick={submitForm} disabled={submitting || !polygon} className="px-4 py-2 bg-black text-white rounded hover:opacity-90 disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}


