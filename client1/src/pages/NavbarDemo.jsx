import React from 'react';
import AuthNavbar from '@/components/AuthNavbar';

export default function NavbarDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthNavbar />
      
      {/* Demo Content */}
      <div className="pt-20 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">AuthNavbar Demo</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Features</h2>
            <ul className="space-y-2 text-gray-600">
              <li>✅ Responsive design with mobile hamburger menu</li>
              <li>✅ Brand logo with navigation to home</li>
              <li>✅ Navigation links (Home, About, Contact, Help)</li>
              <li>✅ Sign Up button with blue styling</li>
              <li>✅ Active route highlighting</li>
              <li>✅ Smooth mobile menu animations</li>
              <li>✅ Consistent with existing design system</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Navigation Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Home</h3>
                <p className="text-sm text-gray-600">Navigate to the landing page</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">About</h3>
                <p className="text-sm text-gray-600">Learn about Bhu-Nirakshak</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Contact</h3>
                <p className="text-sm text-gray-600">Get in touch with us</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Help</h3>
                <p className="text-sm text-gray-600">Find support and guidance</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Responsive Behavior</h2>
            <div className="space-y-3 text-gray-600">
              <p><strong>Desktop (&gt;768px):</strong> Horizontal navigation with all links visible</p>
              <p><strong>Mobile (&lt;768px):</strong> Hamburger menu with animated dropdown</p>
              <p><strong>Features:</strong> Smooth transitions, proper spacing, and touch-friendly interactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
