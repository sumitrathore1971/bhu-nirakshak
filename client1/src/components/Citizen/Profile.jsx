import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';

export default function Profile() {
  const profileInfo = [
    { label: 'Full Name', value: 'Rahul Sharma', icon: User },
    { label: 'Email', value: 'rahul.sharma@email.com', icon: Mail },
    { label: 'Phone', value: '+91 98765 43210', icon: Phone },
    { label: 'Address', value: '123 Main Street, Indore, MP', icon: MapPin },
    { label: 'Member Since', value: 'January 2024', icon: Calendar },
    { label: 'Account Type', value: 'Verified Citizen', icon: Shield },
  ];

  const stats = [
    { label: 'Reports Submitted', value: '12' },
    { label: 'Active Cases', value: '3' },
    { label: 'Resolved Cases', value: '8' },
    { label: 'Response Rate', value: '95%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account information and view your activity summary.</p>
      </motion.div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Rahul Sharma</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Verified Citizen • Member since January 2024</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-sm rounded-full font-medium">
                Active
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-sm rounded-full font-medium">
                Verified
              </span>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6 text-center"
          >
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Profile Information */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileInfo.map((info, index) => (
            <motion.div
              key={info.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-3 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                <info.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{info.label}</p>
                <p className="font-medium text-gray-900 dark:text-white">{info.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Profile updated', time: '2 days ago', type: 'update' },
            { action: 'New report submitted', time: '1 week ago', type: 'report' },
            { action: 'Case status changed', time: '2 weeks ago', type: 'case' },
            { action: 'Account verified', time: '1 month ago', type: 'verification' },
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'update' ? 'bg-blue-500' :
                  activity.type === 'report' ? 'bg-green-500' :
                  activity.type === 'case' ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`}></div>
                <span className="font-medium text-gray-900 dark:text-white">{activity.action}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">Account Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-left">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-left">
            <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Notification Settings</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage email preferences</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
