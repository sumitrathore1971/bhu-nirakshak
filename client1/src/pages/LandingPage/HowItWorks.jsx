import React from "react";
import { motion } from "framer-motion";
import { IconBrain, IconUserCheck, IconCamera, IconGavel, IconActivity } from "@tabler/icons-react";

const steps = [
  { icon: <IconBrain size={28} className="text-primary" />, title: "Detect", desc: "AI + Satellite/Drone Data" },
  { icon: <IconUserCheck size={28} className="text-primary" />, title: "Report", desc: "Citizen/Inspector" },
  { icon: <IconCamera size={28} className="text-primary" />, title: "Verify", desc: "PhotoDCR + BhuNaksha" },
  { icon: <IconGavel size={28} className="text-primary" />, title: "Act", desc: "Enforcement" },
  { icon: <IconActivity size={28} className="text-primary" />, title: "Track", desc: "Live Case Status" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-neutral-950 dark:to-neutral-900">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12 text-gray-900 dark:text-white">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="flex flex-col items-center text-center relative md:flex-1 w-full min-w-0"
            >
              <div className="mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 relative z-20">
                {step.icon}
              </div>
              <h4 className="font-semibold text-lg text-gray-800 dark:text-white mb-1">{step.title}</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{step.desc}</p>
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="hidden md:block absolute left-1/2 top-7 h-1 w-16 md:w-20 lg:w-24 border-t-2 border-dashed border-primary/40 z-10"
                  style={{ transform: 'translateX(50%)' }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}