import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, LogIn } from 'lucide-react';
import reportService from '../../services/reportService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ReportForm({ onSubmit, location, setLocation }) {
  const { user, isAuthenticated } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flashMessage, setFlashMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const hasCoords = Number.isFinite(location?.lat) && Number.isFinite(location?.lng);
  const requiredOk = Boolean(fullName.trim() && phone.trim() && title.trim() && description.trim() && category && date && hasCoords);

  // Prefill name and email from authenticated user
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name || '');
      if (!email) setEmail(user.email || '');
    }
  }, [user]);

  function handleFiles(e) {
    const list = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...list]);
  }
  
  function removeFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }
  
  function handleLatChange(val) {
    const lat = parseFloat(val);
    if (!Number.isNaN(lat)) setLocation({ ...(location || {}), lat, lng: location?.lng ?? null });
  }
  
  function handleLngChange(val) {
    const lng = parseFloat(val);
    if (!Number.isNaN(lng)) setLocation({ ...(location || {}), lat: location?.lat ?? null, lng });
  }

  function handleAddressChange(val) {
    setLocation({ ...(location || {}), address: val });
  }

  function handleAreaChange(val) {
    setLocation({ ...(location || {}), area: val });
  }

  function showFlashMessage(message, type = 'success') {
    setFlashMessage({ message, type });
    setTimeout(() => setFlashMessage(null), 5000);
  }

  function clearErrors() {
    setErrors({});
  }

  async function submit(e) {
    e.preventDefault();
    if (!requiredOk || isSubmitting) return;

    // Check authentication before submitting
    if (!isAuthenticated) {
      showFlashMessage('Please log in to submit a report.', 'error');
      return;
    }

    clearErrors();
    setIsSubmitting(true);

    try {
      // Prepare report data
      const reportData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        title: title.trim(),
        description: description.trim(),
        category,
        date,
        location: {
          lat: location.lat,
          lng: location.lng,
          address: location.address || '',
          area: location.area || ''
        }
      };

      // Validate data
      const validation = reportService.validateReportData(reportData);
      if (!validation.isValid) {
        setErrors(validation.errors.reduce((acc, error) => {
          // Map validation errors to form fields
          if (error.includes('name')) acc.fullName = error;
          else if (error.includes('phone')) acc.phone = error;
          else if (error.includes('email')) acc.email = error;
          else if (error.includes('title')) acc.title = error;
          else if (error.includes('Description')) acc.description = error;
          else if (error.includes('Category')) acc.category = error;
          else if (error.includes('date')) acc.date = error;
          else if (error.includes('Location')) acc.location = error;
          return acc;
        }, {}));
        return;
      }

      // Submit report
      const response = await reportService.submitReport(reportData);
      
      // Show success message
      showFlashMessage(`Report submitted successfully! Your report ID is: ${response.report.reportId}`, 'success');
      
      // Reset form
      setFullName('');
      setPhone('');
      setEmail('');
      setTitle('');
      setDescription('');
      setCategory('');
      setDate('');
      setFiles([]);
      setLocation(null);
      
      // Call parent onSubmit if provided
      if (onSubmit) {
        onSubmit(response.report);
      }
      
    } catch (error) {
      console.error('Error submitting report:', error);
      
      // Handle specific error types
      if (error.message.includes('Authentication required') || error.message.includes('Authentication failed')) {
        showFlashMessage('Authentication required. Please log in to submit a report.', 'error');
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.message.includes('Validation failed')) {
        // Handle validation errors from server
        const serverErrors = error.errors || [];
        const fieldErrors = {};
        serverErrors.forEach(err => {
          if (err.includes('name')) fieldErrors.fullName = err;
          else if (err.includes('phone')) fieldErrors.phone = err;
          else if (err.includes('email')) fieldErrors.email = err;
          else if (err.includes('title')) fieldErrors.title = err;
          else if (err.includes('description')) fieldErrors.description = err;
          else if (err.includes('category')) fieldErrors.category = err;
          else if (err.includes('date')) fieldErrors.date = err;
          else if (err.includes('location')) fieldErrors.location = err;
        });
        setErrors(fieldErrors);
      } else {
        showFlashMessage(error.message || 'Failed to submit report. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show authentication warning if not logged in
  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <LogIn size={24} className="text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Authentication Required
            </h3>
          </div>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            You need to be logged in to submit a report. Please log in with your citizen account.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.href = '/signup'}
              className="px-4 py-2 border border-yellow-600 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Flash Message */}
      <AnimatePresence>
        {flashMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg border flex items-center justify-between ${
              flashMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {flashMessage.type === 'success' ? (
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
              )}
              <span className="font-medium">{flashMessage.message}</span>
            </div>
            <button
              onClick={() => setFlashMessage(null)}
              className="p-1 hover:bg-black/10 rounded"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name *
            </label>
            <input 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              placeholder="Enter your full name" 
              className={`mt-1 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.fullName 
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-neutral-700'
              }`}
              readOnly={!!user?.name}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact Number *
            </label>
            <input 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              type="tel" 
              placeholder="e.g., 9876543210" 
              className={`mt-1 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.phone 
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-neutral-700'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              type="email" 
              placeholder="you@example.com" 
              className={`mt-1 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.email 
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-neutral-700'
              }`}
              readOnly={!!user?.email}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date of Observation *
            </label>
            <input 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              type="date" 
              className={`mt-1 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white ${
                errors.date 
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-neutral-700'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Report Title *
            </label>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Brief title for the encroachment report" 
              className={`mt-1 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.title 
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-neutral-700'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address
              </label>
              <input
                value={location?.address ?? ''}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="House/Street, Landmark, City"
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.location 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-neutral-700'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Area / Locality
              </label>
              <input
                value={location?.area ?? ''}
                onChange={(e) => handleAreaChange(e.target.value)}
                placeholder="e.g., Rajwada, Palasia"
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.location 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-neutral-700'
                }`}
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description of Encroachment *
            </label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={4} 
              placeholder="Describe the encroachment in detail..." 
              className={`mt-1 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.description 
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-neutral-700'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category of Encroachment *
            </label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className={`mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white ${
                errors.category 
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-neutral-700'
              }`}
            >
              <option value="">Select category</option>
              <option value="Public Land">Public Land</option>
              <option value="Private Land">Private Land</option>
              <option value="Road">Road</option>
              <option value="Riverbank">Riverbank</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Latitude *
              </label>
              <input 
                value={location?.lat ?? ''} 
                onChange={(e) => handleLatChange(e.target.value)} 
                type="number" 
                step="any" 
                placeholder="Lat" 
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.location 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-neutral-700'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Longitude *
              </label>
              <input 
                value={location?.lng ?? ''} 
                onChange={(e) => handleLngChange(e.target.value)} 
                type="number" 
                step="any" 
                placeholder="Lng" 
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.location 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-neutral-700'
                }`}
              />
            </div>
          </div>
          {errors.location && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.location}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Photos/Videos
          </label>
          <div className="mt-1 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg p-4 text-center">
            <input id="media" className="hidden" multiple accept="image/*,video/*" type="file" onChange={handleFiles} />
            <label htmlFor="media" className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-neutral-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-gray-700 dark:text-gray-300">
              Upload
            </label>
            {files.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
                {files.map((f, idx) => (
                  <div key={`${f.name}-${idx}`} className="border border-gray-200 dark:border-neutral-700 rounded p-2 text-xs flex items-center justify-between gap-2 bg-gray-50 dark:bg-neutral-800">
                    <span className="truncate max-w-[10rem] text-gray-900 dark:text-white">{f.name}</span>
                    <button type="button" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" onClick={() => removeFile(idx)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button 
            type="submit" 
            disabled={!requiredOk || isSubmitting} 
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              requiredOk && !isSubmitting
                ? 'bg-primary text-white hover:bg-primary/90' 
                : 'bg-gray-300 dark:bg-neutral-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
