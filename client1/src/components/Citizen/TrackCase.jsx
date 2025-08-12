import { motion } from 'framer-motion';
import { Search, FileText, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function TrackCase() {
  const caseStatuses = [
    { status: 'Pending', icon: Clock, color: 'bg-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20', textColor: 'text-yellow-800 dark:text-yellow-400' },
    { status: 'In Progress', icon: FileText, color: 'bg-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/20', textColor: 'text-blue-800 dark:text-blue-400' },
    { status: 'Under Review', icon: AlertCircle, color: 'bg-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/20', textColor: 'text-orange-800 dark:text-orange-400' },
    { status: 'Resolved', icon: CheckCircle, color: 'bg-green-500', bgColor: 'bg-green-100 dark:bg-green-900/20', textColor: 'text-green-800 dark:text-green-400' },
    { status: 'Closed', icon: XCircle, color: 'bg-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-900/20', textColor: 'text-gray-800 dark:text-gray-400' },
  ];

  const sampleCases = [
    {
      id: 'BN-2024-ABC12',
      title: 'Illegal Construction on Public Land',
      status: 'In Progress',
      submitted: '2024-01-15',
      lastUpdate: '2024-01-20',
      description: 'Unauthorized construction activity observed in public park area',
      location: 'Central Park, Indore',
      priority: 'High'
    },
    {
      id: 'BN-2024-XYZ89',
      title: 'Land Encroachment in Residential Area',
      status: 'Under Review',
      submitted: '2024-01-10',
      lastUpdate: '2024-01-18',
      description: 'Fence extending beyond property boundaries',
      location: 'Vijay Nagar, Indore',
      priority: 'Medium'
    },
    {
      id: 'BN-2024-DEF45',
      title: 'Commercial Structure on Agricultural Land',
      status: 'Resolved',
      submitted: '2024-01-05',
      lastUpdate: '2024-01-25',
      description: 'Shop constructed without proper permits',
      location: 'Rajendra Nagar, Indore',
      priority: 'High'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">Track Case</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor the progress of your submitted reports and track case status.</p>
      </motion.div>

      {/* Search Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">Search Case</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter Case ID (e.g., BN-2024-ABC12)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">Case Status Legend</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {caseStatuses.map((status) => (
            <div key={status.status} className="flex items-center gap-3 p-3 rounded-lg">
              <div className={`w-3 h-3 ${status.color} rounded-full`}></div>
              <span className={`text-sm font-medium ${status.textColor}`}>{status.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* My Cases */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">My Cases</h2>
        <div className="space-y-4">
          {sampleCases.map((caseItem, index) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border border-gray-200 dark:border-neutral-700 rounded-lg p-6 hover:shadow-md transition-shadow bg-gray-50 dark:bg-neutral-800"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{caseItem.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      caseItem.priority === 'High' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' :
                      caseItem.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                      'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                    }`}>
                      {caseItem.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{caseItem.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Case ID:</span>
                      <span className="ml-2 font-mono text-gray-900 dark:text-white">{caseItem.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{caseItem.location}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Submitted:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{caseItem.submitted}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Last Update:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{caseItem.lastUpdate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    caseItem.status === 'Resolved' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                    caseItem.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                    caseItem.status === 'Under Review' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400' :
                    caseItem.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                    'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                  }`}>
                    {caseItem.status}
                  </div>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-gray-900 dark:text-white">Submit New Report</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
            <Search className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-gray-900 dark:text-white">Search All Cases</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-gray-900 dark:text-white">View Timeline</span>
          </button>
        </div>
      </div>
    </div>
  );
}
