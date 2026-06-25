'use client';

import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { FileText, Download, Upload, Eye, Search, File, FileImage, X, CheckCircle2 } from 'lucide-react';

const DOCUMENTS = [
  { id: 1, name: 'Offer Letter', category: 'Joining', size: '245 KB', date: '2023-01-15', type: 'pdf', status: 'Verified' },
  { id: 2, name: 'Appointment Letter', category: 'Joining', size: '189 KB', date: '2023-01-15', type: 'pdf', status: 'Verified' },
  { id: 3, name: 'PAN Card', category: 'KYC', size: '512 KB', date: '2023-01-20', type: 'image', status: 'Verified' },
  { id: 4, name: 'Aadhaar Card', category: 'KYC', size: '620 KB', date: '2023-01-20', type: 'image', status: 'Verified' },
  { id: 5, name: 'Salary Slip - May 2025', category: 'Payroll', size: '156 KB', date: '2025-06-01', type: 'pdf', status: 'Verified' },
  { id: 6, name: 'Salary Slip - Apr 2025', category: 'Payroll', size: '156 KB', date: '2025-05-01', type: 'pdf', status: 'Verified' },
  { id: 7, name: 'Experience Letter', category: 'Employment', size: '98 KB', date: '2024-12-31', type: 'pdf', status: 'Pending' },
  { id: 8, name: 'Form 16 - 2024-25', category: 'Tax', size: '320 KB', date: '2025-06-10', type: 'pdf', status: 'Verified' },
];

const CATEGORIES = ['All', 'Joining', 'KYC', 'Payroll', 'Employment', 'Tax'];

export default function DocumentsPage() {
  const { user } = useUser();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [docs, setDocs] = useState(DOCUMENTS);

  const filtered = docs.filter(d =>
    (activeCategory === 'All' || d.category === activeCategory) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploaded(true);
    setShowUpload(false);
    setTimeout(() => setUploaded(false), 3000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage your important documents</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Upload size={16} /> Upload Document
        </button>
      </div>

      {/* Success Toast */}
      {uploaded && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <CheckCircle2 size={16} /> Document uploaded successfully!
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Documents', value: docs.length },
          { label: 'Verified', value: docs.filter(d => d.status === 'Verified').length },
          { label: 'Pending', value: docs.filter(d => d.status === 'Pending').length },
          { label: 'Categories', value: CATEGORIES.length - 1 },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-1 border border-gray-200">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none flex-1 text-gray-600 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${activeCategory === c ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${doc.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                {doc.type === 'pdf' ? <FileText size={20} /> : <FileImage size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{doc.category} · {doc.size}</p>
                <p className="text-xs text-gray-400">{new Date(doc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
                ${doc.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {doc.status}
              </span>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
              <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-teal-600 py-1.5 rounded-lg hover:bg-teal-50 transition-colors">
                <Eye size={14} /> View
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-teal-600 py-1.5 rounded-lg hover:bg-teal-50 transition-colors">
                <Download size={14} /> Download
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            <File size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No documents found</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowUpload(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Upload Document</h3>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Passport Copy"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 transition-colors">
                  <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Click to browse or drag & drop</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                  <input type="file" className="hidden" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowUpload(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}