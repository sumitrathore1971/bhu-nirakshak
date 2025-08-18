import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, FileText, Phone, Mail, MessageCircle } from 'lucide-react';

export default function HelpGuidelines() {
  const [showProcedure, setShowProcedure] = useState(false);
  const [showStatusInfo, setShowStatusInfo] = useState(false);
  const [showTrackingInfo, setShowTrackingInfo] = useState(false);

  const helpTopics = [
    {
      title: 'How to Report Encroachment',
      description: 'Step-by-step guide to report land encroachment issues',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Understanding Case Status',
      description: 'Learn what different case statuses mean',
      icon: HelpCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Tracking Your Report',
      description: 'How to monitor the progress of your submitted reports',
      icon: MessageCircle,
      color: 'bg-purple-500'
    }
  ];

  const contactMethods = [
    { method: 'Phone Support', value: '+91 123-456-7890', icon: Phone, color: 'bg-green-500' },
    { method: 'Email Support', value: 'support@bhunirakshak.gov.in', icon: Mail, color: 'bg-blue-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">Help & Guidelines</h1>
        <p className="text-gray-600 dark:text-gray-400">Get help with using the Citizen Portal and understand the guidelines for reporting issues.</p>
      </motion.div>

      {/* Help Topics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {helpTopics.map((topic, index) => (
          <motion.div
            key={topic.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => {
              if (topic.title === 'How to Report Encroachment') setShowProcedure(true);
              if (topic.title === 'Understanding Case Status') setShowStatusInfo(true);
              if (topic.title === 'Tracking Your Report') setShowTrackingInfo(true);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && topic.title === 'How to Report Encroachment') setShowProcedure(true);
              if (e.key === 'Enter' && topic.title === 'Understanding Case Status') setShowStatusInfo(true);
              if (e.key === 'Enter' && topic.title === 'Tracking Your Report') setShowTrackingInfo(true);
            }}
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className={`${topic.color} p-3 rounded-lg w-fit mb-4`}>
              <topic.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{topic.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{topic.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Guidelines Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">Reporting Guidelines</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Provide Accurate Information</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ensure all details including location, description, and photos are accurate and complete.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Include Supporting Evidence</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upload clear photos and documents that support your report.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Follow Up Responsibly</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Check case updates regularly and provide additional information when requested.</p>
            </div>
          </div>
        </div>
      </div>

      {showProcedure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowProcedure(false)} />
          <div className="relative z-10 w-full max-w-lg mx-auto bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">How to Report Encroachment</h3>
              <button
                onClick={() => setShowProcedure(false)}
                className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              >
                Close
              </button>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Login to the Citizen Portal.</li>
              <li>Navigate to the <span className="font-medium">Report Encroachment</span> section.</li>
              <li>Fill required details: Name, Contact, Date of Observation, Category, Title, Description.</li>
              <li>Mark the exact location on the map and provide address/area details.</li>
              <li>Upload supporting photos or videos (optional but recommended).</li>
              <li>Submit the report and save your Case ID for tracking.</li>
            </ol>
          </div>
        </div>
      )}

      {showStatusInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowStatusInfo(false)} />
          <div className="relative z-10 w-full max-w-lg mx-auto bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Understanding Case Status</h3>
              <button
                onClick={() => setShowStatusInfo(false)}
                className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              >
                Close
              </button>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li><span className="font-medium">Pending</span>: Your report is submitted and awaiting verification.</li>
              <li><span className="font-medium">Verified</span>: Authorities verified the report’s authenticity.</li>
              <li><span className="font-medium">Action Taken</span>: Enforcement actions have been initiated.</li>
              <li><span className="font-medium">Closed</span>: The case is resolved and closed.</li>
              <li><span className="font-medium">Rejected</span>: The report was not accepted due to insufficient/invalid information.</li>
            </ul>
          </div>
        </div>
      )}

      {showTrackingInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowTrackingInfo(false)} />
          <div className="relative z-10 w-full max-w-lg mx-auto bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tracking Your Report</h3>
              <button
                onClick={() => setShowTrackingInfo(false)}
                className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              >
                Close
              </button>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Open the <span className="font-medium">Track Case</span> section in the Citizen Portal.</li>
              <li>Use your <span className="font-medium">Case ID</span> to quickly filter your cases.</li>
              <li>Check the status pill for current stage (Pending, Verified, Action Taken, Closed, Rejected).</li>
              <li>Open your case to view timestamps, notes, and assigned officer (if applicable).</li>
            </ol>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">Contact Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactMethods.map((contact, index) => (
            <motion.div
              key={contact.method}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-3 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className={`${contact.color} p-2 rounded-lg`}>
                <contact.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{contact.method}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{contact.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              question: 'How long does it take to process a report?',
              answer: 'Reports are typically processed within 24-48 hours during business days.'
            },
            {
              question: 'Can I edit a submitted report?',
              answer: 'Yes, you can edit your report within 24 hours of submission.'
            },
            {
              question: 'What happens after I submit a report?',
              answer: 'Your report is reviewed by authorities, assigned a case number, and tracked through the system.'
            }
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
