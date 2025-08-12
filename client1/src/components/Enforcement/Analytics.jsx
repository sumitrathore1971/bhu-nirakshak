import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';

// Mock data for demonstration
const monthlyData = [
  { month: 'Jan', cases: 45, resolved: 32, pending: 13 },
  { month: 'Feb', cases: 52, resolved: 38, pending: 14 },
  { month: 'Mar', cases: 48, resolved: 35, pending: 13 },
  { month: 'Apr', cases: 61, resolved: 42, pending: 19 },
  { month: 'May', cases: 55, resolved: 40, pending: 15 },
  { month: 'Jun', cases: 67, resolved: 48, pending: 19 },
  { month: 'Jul', cases: 58, resolved: 41, pending: 17 },
  { month: 'Aug', cases: 63, resolved: 45, pending: 18 },
  { month: 'Sep', cases: 71, resolved: 52, pending: 19 },
  { month: 'Oct', cases: 65, resolved: 47, pending: 18 },
  { month: 'Nov', cases: 73, resolved: 54, pending: 19 },
  { month: 'Dec', cases: 68, resolved: 49, pending: 19 }
];

const violationTypes = [
  { type: 'Unauthorized Construction', count: 156, percentage: 35 },
  { type: 'Building Plan Violation', count: 98, percentage: 22 },
  { type: 'Illegal Extension', count: 87, percentage: 20 },
  { type: 'Property Boundary Violation', count: 67, percentage: 15 },
  { type: 'Other', count: 32, percentage: 8 }
];

const riskZones = [
  { zone: 'Raj Nagar', cases: 45, riskLevel: 'High', coordinates: [23.2599, 77.4126] },
  { zone: 'MP Nagar', cases: 38, riskLevel: 'High', coordinates: [23.2599, 77.4127] },
  { zone: 'Arera Colony', cases: 32, riskLevel: 'Medium', coordinates: [23.2598, 77.4126] },
  { zone: 'Shahpura', cases: 28, riskLevel: 'Medium', coordinates: [23.2597, 77.4125] },
  { zone: 'Kolar Road', cases: 25, riskLevel: 'Low', coordinates: [23.2596, 77.4124] }
];

const performanceMetrics = {
  totalCases: 156,
  resolvedCases: 112,
  pendingCases: 44,
  avgResolutionTime: '4.2 days',
  successRate: '71.8%',
  fieldInspections: 89,
  enforcementTickets: 67,
  courtCases: 23
};

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedChart, setSelectedChart] = useState('monthly');

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'Low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-blue-600 dark:text-blue-400';
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
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive analysis of enforcement operations</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center space-x-2 shadow-md">
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{performanceMetrics.totalCases}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved Cases</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{performanceMetrics.resolvedCases}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{performanceMetrics.successRate}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{performanceMetrics.avgResolutionTime}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Clock className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Monthly Cases Chart */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Monthly Case Trends</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedChart('monthly')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedChart === 'monthly'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedChart('quarterly')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedChart === 'quarterly'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
              >
                Quarterly
              </button>
            </div>
          </div>
          
          <div className="h-64 bg-gray-50 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Chart visualization would go here</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Monthly case data: {monthlyData.length} months</p>
            </div>
          </div>
        </div>

        {/* Violation Types Chart */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-6">Violation Types Distribution</h2>
          
          <div className="space-y-4">
            {violationTypes.map((violation, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{violation.type}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{violation.count}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">({violation.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Risk Zones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800"
      >
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">High-Risk Zones</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {riskZones.map((zone, index) => (
              <div key={index} className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{zone.zone}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(zone.riskLevel)}`}>
                    {zone.riskLevel}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Cases:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{zone.cases}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Coordinates:</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {zone.coordinates[0].toFixed(4)}, {zone.coordinates[1].toFixed(4)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
                  <button className="w-full px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Additional Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Field Inspections</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{performanceMetrics.fieldInspections}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed this period</p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-orange-600 dark:text-orange-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enforcement Tickets</h3>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{performanceMetrics.enforcementTickets}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Issued this period</p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-red-600 dark:text-red-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Court Cases</h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{performanceMetrics.courtCases}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Filed this period</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
