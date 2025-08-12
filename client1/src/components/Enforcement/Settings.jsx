import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  MapPin, 
  Database,
  Save,
  X,
  Check
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    caseUpdates: true,
    droneAlerts: true,
    systemMaintenance: false
  });

  const [mapSettings, setMapSettings] = useState({
    defaultZoom: 15,
    showRiskZones: true,
    showCaseMarkers: true,
    showDronePaths: false,
    autoRefresh: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'map', label: 'Map Settings', icon: MapPin },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Export', icon: Database }
  ];

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleMapSettingChange = (key, value) => {
    setMapSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-950 min-h-screen">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure your enforcement portal preferences</p>
        </div>
        
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 shadow-md">
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="john.doe@imc.gov.in"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue="+91 98765 43210"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white">
                      <option>IMC Staff</option>
                      <option>Town Planning</option>
                      <option>Revenue</option>
                      <option>Police</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="text-gray-500 dark:text-gray-400" size={20} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('email')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.email ? 'bg-primary' : 'bg-gray-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="text-gray-500 dark:text-gray-400" size={20} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via SMS</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('sms')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.sms ? 'bg-primary' : 'bg-gray-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.sms ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="text-gray-500 dark:text-gray-400" size={20} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates in browser</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('push')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.push ? 'bg-primary' : 'bg-gray-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="text-gray-500 dark:text-gray-400" size={20} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Case Updates</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about case changes</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('caseUpdates')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.caseUpdates ? 'bg-primary' : 'bg-gray-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.caseUpdates ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="text-gray-500 dark:text-gray-400" size={20} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Drone Alerts</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about drone operations</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('droneAlerts')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.droneAlerts ? 'bg-primary' : 'bg-gray-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.droneAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Map Settings */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Map Configuration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Zoom Level</label>
                    <input
                      type="range"
                      min="10"
                      max="20"
                      value={mapSettings.defaultZoom}
                      onChange={(e) => handleMapSettingChange('defaultZoom', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Current: {mapSettings.defaultZoom}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Risk Zones</span>
                      <button
                        onClick={() => handleMapSettingChange('showRiskZones', !mapSettings.showRiskZones)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          mapSettings.showRiskZones ? 'bg-primary' : 'bg-gray-300 dark:bg-neutral-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            mapSettings.showRiskZones ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Case Markers</span>
                      <button
                        onClick={() => handleMapSettingChange('showCaseMarkers', !mapSettings.showCaseMarkers)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          mapSettings.showCaseMarkers ? 'bg-primary' : 'bg-gray-300 dark:bg-neutral-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            mapSettings.showCaseMarkers ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Drone Paths</span>
                      <button
                        onClick={() => handleMapSettingChange('showDronePaths', !mapSettings.showDronePaths)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          mapSettings.showDronePaths ? 'bg-primary' : 'bg-gray-300 dark:bg-neutral-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            mapSettings.showDronePaths ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Refresh</span>
                      <button
                        onClick={() => handleMapSettingChange('autoRefresh', !mapSettings.autoRefresh)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          mapSettings.autoRefresh ? 'bg-primary' : 'bg-gray-300 dark:bg-neutral-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            mapSettings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Security & Privacy</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Shield className="text-blue-600 dark:text-blue-400 mt-1" size={20} />
                      <div>
                        <h3 className="font-medium text-blue-800 dark:text-blue-200">Two-Factor Authentication</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Enhance your account security by enabling two-factor authentication.
                        </p>
                        <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Shield className="text-yellow-600 dark:text-yellow-400 mt-1" size={20} />
                      <div>
                        <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Password Policy</h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Your password must be at least 8 characters long and contain uppercase, lowercase, and numbers.
                        </p>
                        <button className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Shield className="text-green-600 dark:text-green-400 mt-1" size={20} />
                      <div>
                        <h3 className="font-medium text-green-800 dark:text-green-200">Session Management</h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Manage your active sessions and devices.
                        </p>
                        <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                          View Sessions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Export Settings */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Data Management</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Export Data</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Download your data in various formats</p>
                      </div>
                      <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
                        Export
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Data Retention</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Configure how long your data is retained</p>
                      </div>
                      <select className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white text-sm">
                        <option>1 Year</option>
                        <option>2 Years</option>
                        <option>5 Years</option>
                        <option>Indefinitely</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-red-800 dark:text-red-200">Delete Account</h3>
                        <p className="text-sm text-red-700 dark:text-red-300">Permanently delete your account and all data</p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
