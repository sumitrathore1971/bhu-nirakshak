import React from "react";
import { motion } from "framer-motion";
import AuthNavbar from "@/components/AuthNavbar";

export default function About() {
  const container = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const listVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 p-25">
      <AuthNavbar />
      <div className="pt-24 pb-16 px-4">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0b2b5a] dark:text-white">
            About Bhu-Nirakshak
          </h1>
          <p className="mt-4 text-base md:text-lg leading-7 text-gray-600 dark:text-gray-300">
            Bhu-Nirakshak is a Smart Surveillance & Enforcement Platform designed to curb illegal construction and land encroachment in Indore. It integrates AI-powered risk prediction, GIS mapping, drone surveillance, and citizen participation into one unified dashboard.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0b2b5a]/5 dark:bg-white/5 rounded-xl p-6 border border-[#0b2b5a]/10">
              <h2 className="text-xl font-semibold text-[#0b2b5a] dark:text-white">System Capabilities</h2>
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="mt-4 space-y-3"
              >
                {[
                  "AI Risk Scoring",
                  "BhuNaksha cadastral map verification",
                  "Satellite & drone imagery analysis",
                  "Citizen & ground worker reporting",
                  "PhotoDCR building plan compliance checks",
                ].map((text) => (
                  <motion.li
                    key={text}
                    variants={item}
                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{text}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800">
              <h2 className="text-xl font-semibold text-[#0b2b5a] dark:text-white">Who benefits?</h2>
              <div className="mt-4 space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-medium text-[#0b2b5a] dark:text-emerald-400">Citizens</p>
                  <p className="text-sm">Transparent reporting, case tracking, and faster resolution.</p>
                </div>
                <div>
                  <p className="font-medium text-[#0b2b5a] dark:text-emerald-400">Enforcement</p>
                  <p className="text-sm">AI-prioritized cases, geospatial validation, and field-ready workflows.</p>
                </div>
                <div>
                  <p className="font-medium text-[#0b2b5a] dark:text-emerald-400">Administrators</p>
                  <p className="text-sm">City-wide visibility, performance analytics, and policy compliance.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


