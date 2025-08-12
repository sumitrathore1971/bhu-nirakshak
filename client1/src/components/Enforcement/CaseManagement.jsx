import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  MapPin,
  Calendar,
  User,
  Download,
  Send,
  X
} from 'lucide-react';

// Mock data for demonstration
const mockCases = [
  {
    id: 'CASE-001',
    location: 'Raj Nagar, Bhopal',
    violationType: 'Unauthorized Construction',
    submittedBy: 'Citizen',
    riskScore: 85,
    status: 'Pending',
    date: '2024-01-15',
    description: 'Construction of additional floor without permission',
    photos: ['photo1.jpg', 'photo2.jpg'],
    aiAnalysis: 'High probability of unauthorized construction based on image analysis',
    actionHistory: [
      { action: 'Case Created', date: '2024-01-15', officer: 'Officer A' },
      { action: 'Initial Review', date: '2024-01-16', officer: 'Officer B' }
    ]
  },
  {
    id: 'CASE-002',
    location: 'MP Nagar, Bhopal',
    violationType: 'Building Plan Violation',
    submittedBy: 'Drone',
    riskScore: 92,
    status: 'Verified',
    date: '2024-01-14',
    description: 'Deviation from approved building plan',
    photos: ['photo3.jpg', 'photo4.jpg'],
    aiAnalysis: 'Significant deviation detected in building dimensions',
    actionHistory: [
      { action: 'Case Created', date: '2024-01-14', officer: 'Officer C' },
      { action: 'Field Inspection', date: '2024-01-15', officer: 'Officer D' },
      { action: 'Verified Violation', date: '2024-01-16', officer: 'Officer D' }
    ]
  },
  {
    id: 'CASE-003',
    location: 'Arera Colony, Bhopal',
    violationType: 'Illegal Extension',
    submittedBy: 'Ground Worker',
    riskScore: 78,
    status: 'Action Taken',
    date: '2024-01-13',
    description: 'Extension beyond property boundary',
    photos: ['photo5.jpg'],
    aiAnalysis: 'Property boundary violation confirmed',
    actionHistory: [
      { action: 'Case Created', date: '2024-01-13', officer: 'Officer E' },
      { action: 'Notice Issued', date: '2024-01-14', officer: 'Officer E' },
      { action: 'Action Taken', date: '2024-01-15', officer: 'Officer E' }
    ]
  }
];

const statusColors = {
  'Pending': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400',
  'Verified': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400',
  'Action Taken': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400',
  'Closed': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
};

export default function CaseManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredCases = mockCases.filter(caseItem => {
    const matchesSearch = caseItem.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         caseItem.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         caseItem.violationType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setActiveTab('overview');
  };

  const closeModal = () => {
    setSelectedCase(null);
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
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Case Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and manage illegal construction cases</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 shadow-md">
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center space-x-2 shadow-md">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search cases by ID, location, or violation type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Action Taken">Action Taken</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Cases Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Active Cases</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Case ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Violation Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
              {filteredCases.map((caseItem) => (
                <tr key={caseItem.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{caseItem.id}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{caseItem.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{caseItem.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{caseItem.violationType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{caseItem.submittedBy}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        caseItem.riskScore >= 80 ? 'bg-red-500' :
                        caseItem.riskScore >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{caseItem.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[caseItem.status]}`}>
                      {caseItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(caseItem)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                      <Eye size={16} className="mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Case Details Modal */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">{selectedCase.id}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCase.violationType}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <X size={24} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Modal Tabs */}
              <div className="border-b border-gray-200 dark:border-neutral-800">
                <nav className="flex space-x-8 px-6">
                  {['overview', 'photos', 'ai-analysis', 'action-history'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Case Information</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Location:</span>
                            <span className="text-gray-900 dark:text-white font-medium">{selectedCase.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Risk Score:</span>
                            <span className="text-gray-900 dark:text-white font-medium">{selectedCase.riskScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedCase.status]}`}>
                              {selectedCase.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Submitted By:</span>
                            <span className="text-gray-900 dark:text-white font-medium">{selectedCase.submittedBy}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                        <p className="text-gray-700 dark:text-gray-300">{selectedCase.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'photos' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Photos & Videos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedCase.photos.map((photo, index) => (
                        <div key={index} className="aspect-square bg-gray-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400">Photo {index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'ai-analysis' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Analysis</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-blue-800 dark:text-blue-200">{selectedCase.aiAnalysis}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'action-history' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Action History</h3>
                    <div className="space-y-3">
                      {selectedCase.actionHistory.map((action, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{action.action}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{action.date} by {action.officer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800">
                <div className="flex items-center justify-end space-x-3">
                  <button className="px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
                    Mark as Verified
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
                    Assign Field Inspection
                  </button>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    Generate Enforcement Ticket
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
