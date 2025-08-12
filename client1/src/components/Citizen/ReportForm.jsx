import React, { useState } from 'react';

export default function ReportForm({ onSubmit, location, setLocation }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [files, setFiles] = useState([]);

  const requiredOk = fullName.trim() && phone.trim() && description.trim() && category && date && location?.lat && location?.lng;

  function handleFiles(e) {
    const list = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...list]);
  }
  function removeFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }
  function handleLatChange(val) {
    const lat = parseFloat(val);
    if (!Number.isNaN(lat)) setLocation({ lat, lng: location?.lng ?? 0 });
  }
  function handleLngChange(val) {
    const lng = parseFloat(val);
    if (!Number.isNaN(lng)) setLocation({ lat: location?.lat ?? 0, lng });
  }
  function submit(e) {
    e.preventDefault();
    if (!requiredOk) return;
    onSubmit({ fullName, phone, email, description, category, date, files, location });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
          <input 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            placeholder="Enter your full name" 
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-neutral-700 px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number *</label>
          <input 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            type="tel" 
            placeholder="e.g., 9876543210" 
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-neutral-700 px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email" 
            placeholder="you@example.com" 
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-neutral-700 px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Observation *</label>
          <input 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            type="date" 
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-neutral-700 px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white" 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description of Encroachment *</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={4} 
            placeholder="Describe the encroachment..." 
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-neutral-700 px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category of Encroachment *</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white"
          >
            <option value="">Select category</option>
            <option>Public Land</option>
            <option>Private Land</option>
            <option>Road</option>
            <option>Riverbank</option>
            <option>Other</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude *</label>
            <input 
              value={location?.lat ?? ''} 
              onChange={(e) => handleLatChange(e.target.value)} 
              type="number" 
              step="any" 
              placeholder="Lat" 
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-neutral-700 px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude *</label>
            <input 
              value={location?.lng ?? ''} 
              onChange={(e) => handleLngChange(e.target.value)} 
              type="number" 
              step="any" 
              placeholder="Lng" 
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-neutral-700 px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Photos/Videos</label>
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
          disabled={!requiredOk} 
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            requiredOk 
              ? 'bg-primary text-white hover:bg-primary/90' 
              : 'bg-gray-300 dark:bg-neutral-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          Submit Report
        </button>
      </div>
    </form>
  );
}
