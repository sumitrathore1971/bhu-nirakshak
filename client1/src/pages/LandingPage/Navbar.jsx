import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { CONSTANTS } from "@/constants/links";

export default function Navbar() {
  const navItems = [
    { name: "Home", link: "/" },
    { name: "About", link: "/#about" },
    { name: "Features", link: "/#features" },
    { name: "Team", link: "/#team" },
  ];

  const ref = useRef(null);
  const { scrollY } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) setVisible(true);
    else setVisible(false);
  });

  return (
    <motion.div ref={ref} className="w-full fixed top-0 inset-x-0 z-[9999]">
      <DesktopNav visible={visible} navItems={navItems} />
      <MobileNav visible={visible} navItems={navItems} />
    </motion.div>
  );
}

function MobileNav({ navItems, visible }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(10px)" : "none",
          boxShadow: visible
            ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
            : "none",
          width: visible ? "90%" : "100%",
          y: visible ? 20 : 0,
          borderRadius: open ? "4px" : "2rem",
          paddingRight: visible ? "12px" : "0px",
          paddingLeft: visible ? "12px" : "0px",
        }}
        transition={{ type: "spring", stiffness: 200, damping: 50 }}
        className={cn(
          "flex relative flex-col lg:hidden w-full justify-between items-center bg-transparent max-w-[calc(100vw-2rem)] mx-auto px-0 py-2 z-[9999]",
          visible && "bg-white/80 dark:bg-neutral-950/80"
        )}
      >
        <div className="flex flex-row justify-between items-center w-full">
          <Logo />
          {open ? (
            <IconX className="text-black dark:text-white cursor-pointer" onClick={() => setOpen(!open)} />
          ) : (
            <IconMenu2 className="text-black dark:text-white cursor-pointer" onClick={() => setOpen(!open)} />
          )}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex rounded-lg absolute top-16 bg-white dark:bg-neutral-950 inset-x-0 z-[10000] flex-col items-start justify-start gap-4 w-full px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            >
              {navItems.map((navItem, idx) => (
                <Link 
                  key={`link=${idx}`} 
                  to={navItem.link} 
                  onClick={() => setOpen(false)} 
                  className="relative cursor-pointer text-neutral-600 dark:text-neutral-300"
                >
                  <motion.span className="block">{navItem.name}</motion.span>
                </Link>
              ))}

              <div className="flex flex-col gap-2 w-full">
                <Button className="block md:hidden w-full cursor-pointer" variant="destructive">
                  <Link to="/citizen" onClick={() => setOpen(false)} className="cursor-pointer">
                    Report Issue
                  </Link>
                </Button>
                <Button className="block md:hidden w-full cursor-pointer">
                  <Link to="/login" onClick={() => setOpen(false)} className="cursor-pointer">
                    Login
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

function DesktopNavInner({ navItems, visible, hovered, setHovered }) {
  return (
    <>
      <Logo />
      <motion.div className="lg:flex flex-row flex-1 absolute inset-0 hidden items-center justify-center space-x-2 lg:space-x-2 text-sm text-zinc-600 font-medium hover:text-zinc-800 transition duration-200">
        {navItems.map((navItem, idx) => (
          <Link
            onMouseEnter={() => setHovered(idx)}
            className="relative px-4 py-2 cursor-pointer text-neutral-600 dark:text-neutral-300"
            key={`link=${idx}`}
            to={navItem.link}
          >
            {hovered === idx && (
              <motion.div layoutId="hovered" className="w-full h-full absolute inset-0 bg-gray-100 dark:bg-neutral-800 rounded-full" />
            )}
            <span className="relative z-20">{navItem.name}</span>
          </Link>
        ))}
      </motion.div>
      <div className="flex items-center gap-4">
        <Button className="hidden md:block cursor-pointer" variant="destructive">
          <Link to="/citizen" className="cursor-pointer">Report Issue</Link>
        </Button>
        <a href="/login" style={{zIndex : "100"}}>
        <Button className="hidden md:block cursor-pointer">
          <Link to="/login" className="cursor-pointer">Login</Link>
        </Button></a>
      </div>
    </>
  );
}

function DesktopNav({ navItems, visible }) {
  const [hovered, setHovered] = useState(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      style={{ minWidth: "800px" }}
      className={cn(
        "hidden lg:flex flex-row self-start bg-transparent dark:bg-transparent items-center justify-between py-2 max-w-7xl mx-auto px-4 rounded-full relative z-[60] w-full",
        visible && "bg-white/80 dark:bg-neutral-950/80"
      )}
    >
      <DesktopNavInner
        navItems={navItems}
        visible={visible}
        hovered={hovered}
        setHovered={setHovered}
      />
    </motion.div>
  );
}