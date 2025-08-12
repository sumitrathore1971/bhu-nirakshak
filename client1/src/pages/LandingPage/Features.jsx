import React from "react";
import { motion } from "framer-motion";
import { IconMap, IconUserPlus, IconCamera, IconDrone, IconLayoutDashboard } from "@tabler/icons-react";

const features = [
  {
    icon: <IconMap size={32} className="text-primary" />, title: "Real-Time Hotspot Map", desc: "Visualize illegal construction hotspots instantly on a live GIS map."
  },
  {
    icon: <IconUserPlus size={32} className="text-primary" />, title: "Citizen Reporting", desc: "Empower citizens to report suspicious activities with ease."
  },
  {
    icon: <IconCamera size={32} className="text-primary" />, title: "PhotoDCR Validation", desc: "Automated document and photo validation for faster case review."
  },
  {
    icon: <IconDrone size={32} className="text-primary" />, title: "Drone Surveillance", desc: "Integrate aerial data for comprehensive monitoring."
  },
  {
    icon: <IconLayoutDashboard size={32} className="text-primary" />, title: "Role-Based Dashboard", desc: "Custom dashboards for citizens, inspectors, and admins."
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12 text-gray-900 dark:text-white">
          Platform Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10, scale: 1.05, boxShadow: "0 8px 32px rgba(37,99,235,0.12)" }}
              className="flex flex-col items-center bg-gray-50 dark:bg-neutral-900 rounded-xl p-6 shadow-md transition-all cursor-pointer hover:bg-primary/10"
            >
              <div className="mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}