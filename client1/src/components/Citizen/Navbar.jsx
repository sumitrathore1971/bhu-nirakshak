import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useAuth } from '@/context/AuthContext';

export default function CitizenNavbar({ active = 'report', onNavigate }) {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const navItems = [
    { key: 'home', name: 'Home', href: '/' },
    { key: 'report', name: 'Report Encroachment', href: '/citizen' },
    { key: 'my-reports', name: 'My Reports', href: '#' },
    { key: 'help', name: 'Help', href: '#' },
  ];

  const handleClick = (item) => {
    if (onNavigate && (item.key === 'report' || item.key === 'my-reports')) {
      onNavigate(item.key);
    } else if (item.href) {
      window.location.href = item.href;
    }
  };

  return (
    <header className="sticky top-0 z-[999] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="sr-only">Bhu-Nirakshak</span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-700">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.name}
              onClick={() => handleClick(item)}
              className={`px-4 py-2 rounded-full hover:bg-gray-100 ${
                (active === item.key) ? 'bg-gray-100 text-gray-900' : ''
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 relative">
          <Button variant="outline" onClick={() => setUserOpen((v) => !v)} className="px-3">
            User
          </Button>
          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 bg-white border rounded-md shadow-lg w-40 py-2 text-sm"
              >
                <button onClick={() => setUserOpen(false)} className="block w-full text-left px-3 py-2 hover:bg-gray-50">View Profile</button>
                <button onClick={() => { setUserOpen(false); handleLogout(); }} className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50">Logout</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md border"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t"
          >
            <div className="px-4 py-2 grid gap-1 text-sm">
              {navItems.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => { handleClick(item); setOpen(false); }}
                  className={`px-3 py-2 rounded-md hover:bg-gray-100 ${
                    (active === item.key) ? 'bg-gray-100' : ''
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <div className="flex gap-2 pt-2">
                <Button className="w-full" variant="outline">Profile</Button>
                <Button className="w-full" variant="destructive" onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
