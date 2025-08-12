import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Drone, 
  Play, 
  Pause, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  Eye
} from 'lucide-react';

// Mock data for demonstration
const mockDroneTasks = [
  {
    id: 'DRONE-001',
    location: 'Raj Nagar, Bhopal',
    coordinates: [23.2599, 77.4126],
    priority: 'High',
    status: 'Scheduled',
    scheduledTime: '2024-01-16 10:00 AM',
    estimatedDuration: '45 minutes',
    area: '2.5 sq km',
    riskLevel: 'High',
    violations: ['Unauthorized Construction', 'Building Plan Violation'],
    description: 'High-risk area with multiple reported violations'
  },
  {
    id: 'DRONE-002',
    location: 'MP Nagar, Bhopal',
    coordinates: [23.2599, 77.4127],
    priority: 'Medium',
    status: 'In Progress',
    scheduledTime: '2024-01-16 09:00 AM',
    estimatedDuration: '30 minutes',
    area: '1.8 sq km',
    riskLevel: 'Medium',
    violations: ['Illegal Extension'],
    description: 'Follow-up inspection for previous violations'
  },
  {
    id: 'DRONE-003',
    location: 'Arera Colony, Bhopal',
    coordinates: [23.2598, 77.4126],
    priority: 'Low',
    status: 'Completed',
    scheduledTime: '2024-01-16 08:00 AM',
    estimatedDuration: '25 minutes',
    area: '1.2 sq km',
    riskLevel: 'Low',
    violations: [],
    description: 'Routine area monitoring'
  }
];

const mockDroneFeed = {
  isLive: true,
  currentLocation: 'Raj Nagar, Bhopal',
  altitude: '120m',
  battery: '85%',
  signal: 'Strong',
  violations: [
    {
      id: 'VIOL-001',
      type: 'Unauthorized Construction',
      confidence: 92,
      coordinates: [23.2599, 77.4126],
      timestamp: '2024-01-16 10:15 AM'
    },
    {
      id: 'VIOL-002',
      type: 'Building Plan Violation',
      confidence: 87,
      coordinates: [23.2599, 77.4127],
      timestamp: '2024-01-16 10:18 AM'
    }
  ]
};

export default function DroneOperations() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'Low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'In Progress': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'Completed': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'High': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'Low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
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
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Drone Operations</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage drone surveillance operations</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsLiveFeedActive(!isLiveFeedActive)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-md ${
              isLiveFeedActive 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isLiveFeedActive ? <Pause size={16} /> : <Play size={16} />}
            <span>{isLiveFeedActive ? 'Stop Feed' : 'Start Feed'}</span>
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center space-x-2 shadow-md">
            <Download size={16} />
            <span>Export Data</span>
          </button>
        </div>
      </motion.div>

      {/* Live Drone Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Live Drone Feed</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isLiveFeedActive ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isLiveFeedActive ? 'Live' : 'Offline'}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Battery: {mockDroneFeed.battery}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Drone Status */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Location</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{mockDroneFeed.currentLocation}</p>
                </div>
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Altitude</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{mockDroneFeed.altitude}</p>
                </div>
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Signal</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{mockDroneFeed.signal}</p>
                </div>
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isLiveFeedActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Feed Placeholder */}
            <div className="bg-gray-100 dark:bg-neutral-800 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center">
                <Drone size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  {isLiveFeedActive ? 'Live Drone Feed' : 'Drone Feed Offline'}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {isLiveFeedActive ? 'Real-time surveillance in progress' : 'Click Start Feed to begin'}
                </p>
              </div>
            </div>
          </div>

          {/* AI Detected Violations */}
          {isLiveFeedActive && mockDroneFeed.violations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Detected Violations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockDroneFeed.violations.map((violation) => (
                  <div key={violation.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-red-800 dark:text-red-200">{violation.type}</h4>
                      <span className="text-sm text-red-600 dark:text-red-400">{violation.confidence}% confidence</span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">{violation.timestamp}</p>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-red-500" />
                      <span className="text-sm text-red-700 dark:text-red-300">
                        {violation.coordinates[0].toFixed(4)}, {violation.coordinates[1].toFixed(4)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Scheduled Drone Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800"
      >
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Scheduled Drone Tasks</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {mockDroneTasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-6 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.id}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{task.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{task.scheduledTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{task.estimatedDuration}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Area Coverage</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{task.area}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Risk Level</p>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(task.riskLevel)}`}>
                          {task.riskLevel}
                        </span>
                      </div>
                    </div>
                    
                    {task.violations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Expected Violations:</p>
                        <div className="flex flex-wrap gap-2">
                          {task.violations.map((violation, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-xs rounded-full">
                              {violation}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{task.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded-lg transition-colors">
                      <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded-lg transition-colors">
                      <Download size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Task Details Modal */}
      {selectedTask && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTask(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">{selectedTask.id}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedTask.location}</p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Priority</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled Time</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTask.scheduledTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTask.estimatedDuration}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTask.description}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800">
              <div className="flex items-center justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
                  Reschedule
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Start Mission
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
