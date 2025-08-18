import React from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, FileText } from 'lucide-react';
import { getStaticBaseUrl } from '../../lib/utils.js';

export default function ReportDetailsModal({ open, onClose, report }) {
  if (!open || !report) return null;

  // Debug logging
  console.log('ReportDetailsModal - Report data:', report);
  console.log('ReportDetailsModal - Media array:', report.media);

  // Function to check if a file is an image
  const isImage = (mimeType) => {
    return mimeType && mimeType.startsWith('image/');
  };

  // Function to get the full URL for media files
  const getMediaUrl = (mediaItem) => {
    console.log('getMediaUrl - mediaItem:', mediaItem);
    
    if (mediaItem.url) {
      // If it's already a full URL, use it as is
      if (mediaItem.url.startsWith('http://') || mediaItem.url.startsWith('https://')) {
        console.log('getMediaUrl - Full URL detected:', mediaItem.url);
        return mediaItem.url;
      }
      // If it's a relative path, construct the full URL
      if (mediaItem.url.startsWith('/uploads/')) {
        const baseUrl = getStaticBaseUrl();
        const fullUrl = `${baseUrl}${mediaItem.url}`;
        console.log('getMediaUrl - Constructed URL from relative path:', fullUrl);
        return fullUrl;
      }
      // If it's just a filename, construct the uploads URL
      const baseUrl = getStaticBaseUrl();
      const fullUrl = `${baseUrl}/uploads/${mediaItem.filename}`;
      console.log('getMediaUrl - Constructed URL from filename:', fullUrl);
      return fullUrl;
    }
    console.log('getMediaUrl - No URL found, returning null');
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">{report.reportId}</h3>
            <p className="text-gray-600 dark:text-gray-400">{report.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"><X size={20} className="text-gray-500 dark:text-gray-400"/></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Report Details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Report Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{report.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{report.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date Observed</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(report.dateOfObservation).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Submitted</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
                  {report.description}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Location</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {report.location?.area || report.formattedAddress || "Location coordinates"}
                </p>
              </div>
            </div>

            {/* Media Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Media Files</h4>
              
              {report.media && report.media.length > 0 ? (
                <div className="space-y-3">
                  {report.media.map((media, index) => {
                    const mediaUrl = getMediaUrl(media);
                    const isImageFile = isImage(media.mimeType);
                    
                    console.log(`Media ${index}:`, {
                      media,
                      mediaUrl,
                      isImageFile,
                      mimeType: media.mimeType
                    });
                    
                    return (
                      <div key={index} className="border border-gray-200 dark:border-neutral-700 rounded-lg p-3">
                        {isImageFile && mediaUrl ? (
                          <div className="space-y-2">
                            <img
                              src={mediaUrl}
                              alt={media.originalName}
                              className="w-full h-48 object-cover rounded-lg"
                              onLoad={() => console.log(`Image loaded successfully: ${mediaUrl}`)}
                              onError={(e) => {
                                console.error(`Image failed to load: ${mediaUrl}`, e);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden flex items-center justify-center h-48 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                              <div className="text-center">
                                <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Image not available</p>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {media.originalName} • {(media.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                            <FileText size={24} className="text-gray-400" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {media.originalName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {(media.size / 1024 / 1024).toFixed(2)} MB • {media.mimeType}
                              </p>
                            </div>
                            {mediaUrl && (
                              <a
                                href={mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90 transition-colors"
                              >
                                Download
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ImageIcon size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No media files attached to this report</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
