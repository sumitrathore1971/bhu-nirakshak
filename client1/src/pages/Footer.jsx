import React from "react";
import {
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandInstagram,
  IconPhone,
  IconMail,
  IconMapPin,
} from "@tabler/icons-react";



export default function Footer() {
  return (
    <footer id="about" className="bg-[#0f172a] text-white pt-12 pb-4 px-4 md:px-0">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between gap-10 border-b border-slate-700 pb-10">
        {/* About */}
        <div className="md:w-1/3 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-blue-500 mb-2">About Bhu-Nirakshak</h3>
          <p className="text-slate-200 text-sm leading-relaxed">
            Bhu-Nirakshak is a smart surveillance & enforcement platform that uses AI, GIS, drone technology, and citizen engagement to detect and prevent illegal construction in real time.
          </p>
          <div className="flex gap-4 mb-2 md:mb-0">
          <a href="#" className="hover:text-blue-400 transition-colors" aria-label="Facebook">
            <IconBrandFacebook size={22} />
          </a>
          <a href="#" className="hover:text-blue-400 transition-colors" aria-label="Twitter/X">
            <IconBrandTwitter size={22} />
          </a>
          <a href="#" className="hover:text-blue-400 transition-colors" aria-label="LinkedIn">
            <IconBrandLinkedin size={22} />
          </a>
          <a href="#" className="hover:text-blue-400 transition-colors" aria-label="Instagram">
            <IconBrandInstagram size={22} />
          </a>
        </div>
        </div>
        
        {/* Quick Links */}
        <div className="md:w-1/6 flex flex-col gap-2">
          <h4 className="text-lg font-semibold mb-2 text-blue-400">Quick Links</h4>
          <a href="#" className="hover:text-blue-400 transition-colors">Home</a>
          <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
          <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
        </div>
        {/* Contact Info */}
        <div className="md:w-1/3 flex flex-col gap-2">
          <h4 className="text-lg font-semibold mb-2 text-blue-400">Contact Info</h4>
          <div className="flex items-start gap-2 text-slate-200 text-sm">
            <IconMapPin size={18} className="text-blue-400 mt-0.5" />
            Indore Smart City Development Limited
          </div>
          <div className="flex items-start gap-2 text-slate-200 text-sm">
            <IconPhone size={18} className="text-blue-400 mt-0.5" />
            7222944058 (Team Lead: Sumit Rathore)
          </div>
          <div className="flex items-start gap-2 text-slate-200 text-sm">
            <IconPhone size={18} className="text-blue-400 mt-0.5" />
            8319403417 (Shruti Singh)
          </div>
          <div className="flex items-start gap-2 text-slate-200 text-sm">
            <IconPhone size={18} className="text-blue-400 mt-0.5" />
            9179288495 (Rohit Prajapat)
          </div>
          <div className="flex items-start gap-2 text-slate-200 text-sm">
            <IconPhone size={18} className="text-blue-400 mt-0.5" />
            9669466562 (Kartik Prajapat)
          </div>
          <div className="flex items-start gap-2 text-slate-200 text-sm">
            <IconMail size={18} className="text-blue-400 mt-0.5" />
            info@bhu-nirakshak.com
          </div>
        </div>
      </div>

      {/* Team Section */}
     

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-700">
        {/* Social Icons */}
        
        <div className="text-xs text-slate-400 text-center mx-auto">
          © 2025 &nbsp;<img src="/assets/whitelogo.png" style={{marginBottom : "7px"}} alt="Bhu Nirakshak" className="h-4 w-auto inline-block" />Bhu Nirakshak | All Rights Reserved | Made with ❤️ by Team Innovate Infinity
        </div>
      </div>
    </footer>
  );
}