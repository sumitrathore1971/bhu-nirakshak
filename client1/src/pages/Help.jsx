import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthNavbar from "@/components/AuthNavbar";

export default function Help() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Can I report anonymously?",
      a: "Currently, login is required to ensure authenticity.",
    },
    {
      q: "How long until action is taken?",
      a: "Verified reports are acted upon within 72 hours.",
    },
  ];

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950  p-25">
      <AuthNavbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0b2b5a] dark:text-white">
            Help & Guidelines
          </h1>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6"
            >
              <h2 className="text-xl font-semibold text-[#0b2b5a] dark:text-white">How to Report Encroachment</h2>
              <ol className="mt-4 space-y-3 text-gray-700 dark:text-gray-300 list-decimal list-inside">
                <li>Login to Citizen Portal</li>
                <li>Go to Report Encroachment</li>
                <li>
                  Fill in required details (name, contact, date, category, description)
                </li>
                <li>Mark exact location on the map</li>
                <li>Upload supporting media</li>
                <li>Submit and save your Case ID</li>
              </ol>

              <div className="mt-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <h3 className="font-medium text-emerald-700 dark:text-emerald-300">Tracking Your Report</h3>
                <ul className="mt-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                  <li>Access "My Reports" page</li>
                  <li>View details to see status updates</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-[#0b2b5a]/5 dark:bg-white/5 rounded-xl border border-[#0b2b5a]/10 p-6"
            >
              <h2 className="text-xl font-semibold text-[#0b2b5a] dark:text-white">FAQs</h2>
              <div className="mt-4 divide-y divide-gray-200 dark:divide-neutral-800">
                {faqs.map((f, i) => (
                  <div key={f.q} className="py-3">
                    <button
                      onClick={() => toggle(i)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="font-medium text-gray-800 dark:text-gray-200">{f.q}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {openIndex === i ? "−" : "+"}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {openIndex === i && (
                        <motion.p
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden pt-2 text-gray-600 dark:text-gray-300"
                        >
                          {f.a}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}


