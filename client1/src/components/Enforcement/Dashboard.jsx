import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  MapPin,
  Filter,
  Calendar,
  Search
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Mock data for demonstration
const mockCases = [
  {
    id: 'CASE-001',
    location: [23.2599, 77.4126], // Bhopal coordinates
    violationType: 'Unauthorized Construction',
    riskScore: 85,
    status: 'Pending',
    submittedBy: 'Citizen',
    date: '2024-01-15'
  },
  {
    id: 'CASE-002',
    location: [23.2599, 77.4127],
    violationType: 'Building Plan Violation',
    riskScore: 92,
    status: 'Verified',
    submittedBy: 'Drone',
    date: '2024-01-14'
  },
  {
    id: 'CASE-003',
    location: [23.2598, 77.4126],
    violationType: 'Illegal Extension',
    riskScore: 78,
    status: 'Action Taken',
    submittedBy: 'Ground Worker',
    date: '2024-01-13'
  }
];

const caseSummary = {
  total: 156,
  pending: 45,
  verified: 67,
  actionTaken: 32,
  closed: 12
};

export default function Dashboard() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [mapLayers, setMapLayers] = useState({
    satellite: false,
    cadastral: false,
    drone: false
  });

  const getMarkerColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Verified': return '#3b82f6';
      case 'Action Taken': return '#ef4444';
      case 'Closed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskZoneColor = (score) => {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f59e0b';
    return '#10b981';
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
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Enforcement Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor illegal construction cases and take action</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 shadow-md">
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center space-x-2 shadow-md">
            <Calendar size={16} />
            <span>Date Range</span>
          </button>
        </div>
      </motion.div>

      {/* Case Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{caseSummary.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{caseSummary.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{caseSummary.verified}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Action Taken</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{caseSummary.actionTaken}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Closed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{caseSummary.closed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Map Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">Live Case Map</h2>
          
          {/* Layer Controls */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setMapLayers(prev => ({ ...prev, satellite: !prev.satellite }))}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mapLayers.satellite
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              Satellite View
            </button>
            <button
              onClick={() => setMapLayers(prev => ({ ...prev, cadastral: !prev.cadastral }))}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mapLayers.cadastral
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              Cadastral Boundaries
            </button>
            <button
              onClick={() => setMapLayers(prev => ({ ...prev, drone: !prev.drone }))}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mapLayers.drone
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              Drone Imagery
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="h-96 relative">
          <MapContainer
            center={[23.2599, 77.4126]}
            zoom={13}
            className="w-full h-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Risk Zones */}
            <Circle
              center={[23.2599, 77.4126]}
              radius={500}
              pathOptions={{
                color: getRiskZoneColor(85),
                fillColor: getRiskZoneColor(85),
                fillOpacity: 0.2
              }}
            />
            
            {/* Case Markers */}
            {mockCases.map((caseItem) => (
              <Marker
                key={caseItem.id}
                position={caseItem.location}
                eventHandlers={{
                  click: () => setSelectedCase(caseItem)
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-900">{caseItem.id}</h3>
                    <p className="text-sm text-gray-600">{caseItem.violationType}</p>
                    <p className="text-sm text-gray-600">Risk: {caseItem.riskScore}</p>
                    <p className="text-sm text-gray-600">Status: {caseItem.status}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </motion.div>

      {/* Recent Cases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800"
      >
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Recent Cases</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {mockCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{caseItem.id}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{caseItem.violationType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{caseItem.status}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Risk: {caseItem.riskScore}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
