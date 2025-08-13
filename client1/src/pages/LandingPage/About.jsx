import React from "react";
import { motion } from "framer-motion";
import { IconBrain, IconMapCheck, IconDrone, IconUsersGroup, IconFileCheck } from "@tabler/icons-react";

export default function About() {
  const items = [
    { icon: <IconBrain size={22} className="text-primary" />, label: "AI Risk Scoring & heatmaps for predicting hotspots." },
    { icon: <IconMapCheck size={22} className="text-primary" />, label: "BhuNaksha Verification to detect boundary violations." },
    { icon: <IconDrone size={22} className="text-primary" />, label: "Satellite & Drone Imagery for real-time monitoring." },
    { icon: <IconUsersGroup size={22} className="text-primary" />, label: "Citizen & Ground Worker Reporting for on-ground insights." },
    { icon: <IconFileCheck size={22} className="text-primary" />, label: "PhotoDCR Integration for automatic plan compliance checks." },
  ];

  return (
    <section id="about" className="py-20 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white">
            About Bhu-Nirakshak
          </h2>
          <p className="mt-4 text-gray-700 dark:text-gray-200 leading-relaxed">
            Bhu-Nirakshak is a Smart Surveillance & Enforcement platform built to curb illegal construction in Indore.
            It unifies AI-powered risk prediction, GIS mapping, drone and satellite imagery, and collaborative reporting
            from citizens and ground workers into one actionable dashboard—enabling early detection, rapid verification,
            and accountable enforcement.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-neutral-900 p-4 border border-gray-200 dark:border-neutral-800">
                <div className="shrink-0 mt-0.5">{item.icon}</div>
                <p className="text-gray-700 dark:text-gray-300 text-sm md:text-[15px]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="h-full rounded-2xl bg-blue-50/70 dark:bg-neutral-900 p-6 border border-blue-100 dark:border-neutral-800 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Why it matters</h3>
            <p className="mt-3 text-gray-700 dark:text-gray-300">
              With faster detection, better coordination, and greater transparency, Bhu-Nirakshak empowers both
              authorities and citizens to keep Indore planned and encroachment-free.
            </p>
            <p className="mt-4 text-gray-900 dark:text-gray-100 font-medium italic">
              "Together, we can safeguard our city’s future."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


