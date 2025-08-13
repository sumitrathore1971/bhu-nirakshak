import React from "react";
import { motion } from "framer-motion";
import AuthNavbar from "@/components/AuthNavbar";
import { IconBrandFacebook, IconBrandTwitter, IconBrandLinkedin, IconBrandInstagram, IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";

export default function Contact() {
  const social = [
    { name: "Facebook", Icon: IconBrandFacebook, href: "#" },
    { name: "Twitter/X", Icon: IconBrandTwitter, href: "#" },
    { name: "LinkedIn", Icon: IconBrandLinkedin, href: "#" },
    { name: "Instagram", Icon: IconBrandInstagram, href: "#" },
  ];

  const team = [
    { name: "Sumit Rathore", phone: "7222944058" },
    { name: "Shruti Singh", phone: "8319403417" },
    { name: "Rohit Prajapat", phone: "9179288495" },
    { name: "Kartik Prajapat", phone: "9669466562" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950  p-25">
      <AuthNavbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0b2b5a] dark:text-white"
          >
            Contact Us
          </motion.h1>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6"
            >
              <h2 className="text-xl font-semibold text-[#0b2b5a] dark:text-white">Indore Smart City Development Limited</h2>
              <div className="mt-4 space-y-3 text-gray-700 dark:text-gray-300">
                <p className="flex items-start gap-3">
                  <IconMapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <span>Indore, Madhya Pradesh, India</span>
                </p>
                <p className="flex items-start gap-3">
                  <IconMail className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <a href="mailto:support@bhu-nirakshak.com" className="hover:underline">
                    support@bhu-nirakshak.com
                  </a>
                </p>

                <div className="mt-6">
                  <h3 className="font-medium text-[#0b2b5a] dark:text-emerald-300">Team Innovate Infinity</h3>
                  <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {team.map((member) => (
                      <li key={member.name} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <IconPhone className="h-5 w-5 text-emerald-600" />
                        <span>
                          {member.name} – <a href={`tel:${member.phone}`} className="hover:underline">{member.phone}</a>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-[#0b2b5a]/5 dark:bg-white/5 rounded-xl border border-[#0b2b5a]/10 p-6"
            >
              <h2 className="text-xl font-semibold text-[#0b2b5a] dark:text-white">Social Media</h2>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {social.map(({ name, Icon, href }) => (
                  <a
                    key={name}
                    href={href}
                    className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-sm transition"
                  >
                    <Icon className="h-6 w-6 text-emerald-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}


