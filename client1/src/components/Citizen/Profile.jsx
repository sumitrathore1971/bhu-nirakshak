import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit, X, Save, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import reportService from '../../services/reportService.js';

export default function Profile() {
  const { user, showFlashMessage, setUser } = useAuth();
  const [profileInfo, setProfileInfo] = useState([]);
  const [stats, setStats] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Function to update profile information display
  const updateProfileInfo = (userData) => {
    const memberSince = new Date(userData.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });

    setProfileInfo([
      { label: 'Full Name', value: userData.name || 'Not provided', icon: User },
      { label: 'Email', value: userData.email || 'Not provided', icon: Mail },
      { label: 'Phone', value: userData.phone || 'Not provided', icon: Phone },
      { label: 'Address', value: userData.address || 'Not provided', icon: MapPin },
      { label: 'Member Since', value: memberSince, icon: Calendar },
      { label: 'Account Type', value: `Verified ${userData.role}`, icon: Shield },
    ]);
  };

  useEffect(() => {
    if (user) {
      // Initialize edit form with current user data
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });

      // Update profile information display
      updateProfileInfo(user);

      // Fetch KPIs from reports API
      (async () => {
        try {
          const [all, pending, verified, actionTaken, closed] = await Promise.all([
            reportService.getMyReports(1, 1),
            reportService.getMyReports(1, 1, 'Pending'),
            reportService.getMyReports(1, 1, 'Verified'),
            reportService.getMyReports(1, 1, 'Action Taken'),
            reportService.getMyReports(1, 1, 'Closed'),
          ]);

          const totalReports = all?.totalReports ?? (Array.isArray(all?.reports) ? all.reports.length : 0);
          const pendingCount = pending?.totalReports ?? 0;
          const verifiedCount = verified?.totalReports ?? 0;
          const actionTakenCount = actionTaken?.totalReports ?? 0;
          const closedCount = closed?.totalReports ?? 0;

          const activeCases = pendingCount + verifiedCount + actionTakenCount;
          const responseRate = totalReports > 0 ? Math.round(((totalReports - pendingCount) / totalReports) * 100) : 0;

          setStats([
            { label: 'Reports Submitted', value: String(totalReports) },
            { label: 'Active Cases', value: String(activeCases) },
            { label: 'Resolved Cases', value: String(closedCount) },
            { label: 'Response Rate', value: `${responseRate}%` },
          ]);
        } catch (e) {
          // Fallback to zeros if API fails
          setStats([
            { label: 'Reports Submitted', value: '0' },
            { label: 'Active Cases', value: '0' },
            { label: 'Resolved Cases', value: '0' },
            { label: 'Response Rate', value: '0%' },
          ]);
        }
      })();
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to current user data
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
    });
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Call the backend API to update profile using axios
      const response = await axios.put('/auth/profile', {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address
      });

      const data = response.data;
      
      // Create updated user object
      const updatedUser = {
        ...user,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address
      };

      // Update user in AuthContext
      setUser(updatedUser);

      // Update local storage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update the profile info display with new values
      updateProfileInfo(updatedUser);

      setIsEditing(false);
      showFlashMessage('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      showFlashMessage(errorMessage, 'error');
    }
  };

  const handleChangePasswordClick = () => {
    setIsChangingPassword(true);
    setPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting to change password...');
      
      // Call the backend API to change password using axios
      const response = await axios.post('/auth/change-password', {
        newPassword: passwordForm.newPassword
      });

      const data = response.data;
      console.log('Success response:', data);
      
      // Close modal and show success
      setIsChangingPassword(false);
      setPasswordForm({
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      
      // Show success flash message
      showFlashMessage('Password changed successfully! You can now login with your new password.', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password. Please try again.';
      showFlashMessage(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Show loading or error state if no user
  if (!user) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Loading profile information...</p>
        </motion.div>
      </div>
    );
  }

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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Verified {user.role} • Member since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-sm rounded-full font-medium">
                Active
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-sm rounded-full font-medium">
                Verified
              </span>
            </div>
          </div>
          <button 
            onClick={handleEditClick}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && handleCancelEdit()}
        >
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-800 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h3>
              <button 
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral-800 dark:text-white"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral-800 dark:text-white"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral-800 dark:text-white"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral-800"
                  placeholder="Enter your address"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && handleCancelPasswordChange()}
        >
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-800 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </h3>
              <button 
                onClick={handleCancelPasswordChange}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral-800 dark:text-white ${
                      passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-neutral-600'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral-800 dark:text-white ${
                      passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-neutral-600'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelPasswordChange}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePassword}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

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

      {/* Account Actions */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">Account Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={handleChangePasswordClick}
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-left"
          >
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
    </div>
  );
}
