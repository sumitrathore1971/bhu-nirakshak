import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const bgUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80";

export default function CallToAction() {
  return (
    <section className="relative py-20 flex items-center justify-center bg-gray-900 ">
      <div className="absolute inset-0 w-full h-full">
        <img src="/assets/rajnagar.jpg" alt="Drone GIS" className="w-full h-full object-cover object-center opacity-70" />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative z-10 max-w-2xl mx-auto text-center px-4">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
          Join the mission to protect Indore’s public spaces. Detect. Report. Prevent.
        </motion.h2>
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.7 }}>
          <Button size="lg" className="px-8 py-3 text-lg shadow-md" variant="default">
            Start Reporting
          </Button>
          <Button size="lg" className="px-8 py-3 text-lg shadow-md" variant="secondary">
            Launch Dashboard
          </Button>
        </motion.div>
      </div>
    </section>
  );
}