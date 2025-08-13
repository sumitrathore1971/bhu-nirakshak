import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IconMenu2, IconX } from "@tabler/icons-react";

import { Logo } from "@/components/logo";

export default function AuthNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", link: "/" },
    { name: "About", link: "/about" },
    { name: "Contact", link: "/contact" },
    { name: "Help", link: "/help" },
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isLoginRoute = location.pathname === "/login";

  return (
    <nav className="bg-white shadow-md fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Branding */}
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>

			{/* Right Side - Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.link}
                className={`text-gray-600 hover:text-blue-600 transition-colors duration-200 ${
                  isActiveRoute(item.link) ? "border-b-2 border-blue-600" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
				{/* Auth CTA: Sign Up on /login, otherwise Login */}
				{isLoginRoute ? (
					<Link
						to="/signup"
						className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium"
					>
						Sign Up
					</Link>
				) : (
					<Link
						to="/login"
						className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium"
					>
						Login
					</Link>
				)}
            
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <IconX className="h-6 w-6" />
              ) : (
                <IconMenu2 className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden">
          <div
            className={`${
              isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            } transition-all duration-300 ease-in-out overflow-hidden`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.link}
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActiveRoute(item.link)
                      ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}

					<div className="pt-4 space-y-2">
						{/* Auth CTA: Sign Up on /login, otherwise Login */}
						{isLoginRoute ? (
							<Link
								to="/signup"
								onClick={closeMobileMenu}
								className="block w-full text-center bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium"
							>
								Sign Up
							</Link>
						) : (
							<Link
								to="/login"
								onClick={closeMobileMenu}
								className="block w-full text-center bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium"
							>
								Login
							</Link>
						)}
					</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
