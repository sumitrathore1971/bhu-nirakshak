import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FlashMessage() {
  const { flashMessage, showFlashMessage } = useAuth();

  if (!flashMessage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg shadow-lg border-l-4 ${
          flashMessage.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-400 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-800 dark:text-red-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {flashMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{flashMessage.message}</p>
          </div>
          <button
            onClick={() => showFlashMessage(null)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
