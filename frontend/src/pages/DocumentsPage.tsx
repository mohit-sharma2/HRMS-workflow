import { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { FileText, Download, Upload, Eye, Search, File, FileImage, X, CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';

const INITIAL_DOCUMENTS = [
  { id: 1, name: 'Offer Letter', category: 'Joining', size: '245 KB', date: '2023-01-15', type: 'pdf', status: 'Verified' },
  { id: 2, name: 'Appointment Letter', category: 'Joining', size: '189 KB', date: '2023-01-15', type: 'pdf', status: 'Verified' },
  { id: 3, name: 'PAN Card', category: 'KYC', size: '512 KB', date: '2023-01-20', type: 'image', status: 'Verified', expiryDate: '2030-12-31' },
  { id: 4, name: 'Aadhaar Card', category: 'KYC', size: '620 KB', date: '2023-01-20', type: 'image', status: 'Verified' },
  { id: 5, name: 'Salary Slip - May 2025', category: 'Payroll', size: '156 KB', date: '2025-06-01', type: 'pdf', status: 'Verified' },
  { id: 6, name: 'Salary Slip - Apr 2025', category: 'Payroll', size: '156 KB', date: '2025-05-01', type: 'pdf', status: 'Verified' },
  { id: 7, name: 'Experience Letter', category: 'Employment', size: '98 KB', date: '2024-12-31', type: 'pdf', status: 'Pending' },
  { id: 8, name: 'Form 16 - 2024-25', category: 'Tax', size: '320 KB', date: '2025-06-10', type: 'pdf', status: 'Verified' },
  { id: 9, name: 'Passport Copy', category: 'KYC', size: '1.2 MB', date: '2025-06-22', type: 'pdf', status: 'Pending', expiryDate: '2026-08-15' },
];

const CATEGORIES = ['All', 'Joining', 'KYC', 'Payroll', 'Employment', 'Tax'];

export default function DocumentsPage() {
  const { user } = useUser();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedMsg, setUploadedMsg] = useState(false);
  const [docs, setDocs] = useState(INITIAL_DOCUMENTS);
  const [form, setForm] = useState({ name: '', category: 'KYC', expiry: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocForView, setSelectedDocForView] = useState<any | null>(null);

  const filtered = docs.filter(d =>
    (activeCategory === 'All' || d.category === activeCategory) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || 'pdf';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);

    const newDoc = {
      id: docs.length + 1,
      name: form.name || selectedFile.name.replace(/\.[^/.]+$/, ""),
      category: form.category,
      size: formatBytes(selectedFile.size),
      date: new Date().toISOString().split('T')[0],
      type: isImage ? 'image' : 'pdf',
      status: 'Pending',
      expiryDate: form.expiry || undefined,
    };
    setDocs([newDoc, ...docs]);
    setForm({ name: '', category: 'KYC', expiry: '' });
    setSelectedFile(null);
    setShowUpload(false);
    setUploadedMsg(true);
    setTimeout(() => setUploadedMsg(false), 3000);
  }

  function handleStatusChange(id: number, verify: boolean) {
    setDocs(prev => prev.map(d =>
      d.id === id ? { ...d, status: verify ? 'Verified' : 'Rejected' } : d
    ));
  }

  function triggerDownload(docName: string) {
    const element = document.createElement("a");
    const fileContent = `WorkFlow HRMS Document Download\n================================\n\nDocument Name: ${docName}\nDownloaded On: ${new Date().toLocaleDateString()}\n\nThis is a secure copy of your document from WorkFlow HRMS database.`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${docName.replace(/\s+/g, '_')}_download.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const isHR = user?.role === 'HR' || user?.role === 'Admin';

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
      {uploadedMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <CheckCircle2 size={16} /> Document uploaded successfully and sent for HR verification!
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Documents', value: docs.length },
          { label: 'Verified', value: docs.filter(d => d.status === 'Verified').length },
          { label: 'Pending Verification', value: docs.filter(d => d.status === 'Pending').length },
          { label: 'Expiring Soon', value: docs.filter(d => d.expiryDate && new Date(d.expiryDate).getFullYear() <= 2026).length },
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
        {filtered.map(doc => {
          const isExpiring = doc.expiryDate && new Date(doc.expiryDate).getFullYear() <= 2026;
          return (
            <div 
              key={doc.id} 
              onClick={() => setSelectedDocForView(doc)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                      ${doc.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                      {doc.type === 'pdf' ? <FileText size={20} /> : <FileImage size={20} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{doc.category} · {doc.size}</p>
                      <p className="text-[10px] text-gray-400">Uploaded on {doc.date}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0
                    ${doc.status === 'Verified' ? 'bg-green-100 text-green-700' :
                      doc.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'}`}>
                    {doc.status}
                  </span>
                </div>

                {/* Expiry display */}
                {doc.expiryDate && (
                  <div className={`mt-3 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium ${
                    isExpiring ? 'bg-red-50 border-red-100 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-500'
                  }`}>
                    {isExpiring ? <AlertTriangle size={12} /> : <FileText size={12} />}
                    <span>Expires: {doc.expiryDate} {isExpiring && '(Action Required)'}</span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                {isHR && doc.status === 'Pending' ? (
                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStatusChange(doc.id, false); }}
                      className="flex-1 text-center py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-semibold transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStatusChange(doc.id, true); }}
                      className="flex-1 text-center py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-xs font-semibold transition-colors animate-pulse"
                    >
                      Verify
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedDocForView(doc); }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-teal-600 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); triggerDownload(doc.name); }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-teal-600 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
                    >
                      <Download size={14} /> Download
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            <File size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No documents found</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => { setShowUpload(false); setSelectedFile(null); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Upload Document</h3>
              <button onClick={() => { setShowUpload(false); setSelectedFile(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Passport Copy"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={form.expiry}
                    onChange={e => setForm({ ...form, expiry: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                      if (!form.name) {
                        setForm(prev => ({ ...prev, name: e.target.files![0].name.replace(/\.[^/.]+$/, "") }));
                      }
                    }
                  }}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="border border-teal-100 bg-teal-50/50 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                        {['jpg', 'jpeg', 'png'].includes(selectedFile.name.split('.').pop()?.toLowerCase() || '') ? (
                          <FileImage size={20} />
                        ) : (
                          <FileText size={20} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatBytes(selectedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        setSelectedFile(e.dataTransfer.files[0]);
                        if (!form.name) {
                          setForm(prev => ({ ...prev, name: e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, "") }));
                        }
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                      ${isDragging 
                        ? 'border-teal-500 bg-teal-50/30' 
                        : 'border-gray-200 hover:border-teal-400 hover:bg-gray-50/30'}`}
                  >
                    <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Click to browse or drag & drop</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowUpload(false); setSelectedFile(null); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!selectedFile}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Document Preview Modal */}
      {selectedDocForView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDocForView(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedDocForView.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedDocForView.category} · {selectedDocForView.size}</p>
              </div>
              <button onClick={() => setSelectedDocForView(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            {/* Document body preview area */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold
                  ${selectedDocForView.status === 'Verified' ? 'bg-green-100 text-green-700' :
                    selectedDocForView.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'}`}>
                  {selectedDocForView.status}
                </span>
              </div>

              {selectedDocForView.type === 'pdf' ? (
                <div className="w-full text-center space-y-4">
                  <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mx-auto">
                    <FileText size={32} />
                  </div>
                  <div className="space-y-2 max-w-sm mx-auto">
                    <h4 className="font-semibold text-gray-900 text-sm">{selectedDocForView.name}.pdf</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      This is a preview of the uploaded PDF document. The file has been scanned for security and is currently marked as <span className="font-medium">{selectedDocForView.status.toLowerCase()}</span> by HR.
                    </p>
                  </div>
                  <div className="border-t border-gray-200/50 pt-4 w-full flex flex-col gap-1.5 text-left text-xs text-gray-400">
                    <div className="flex justify-between"><span>File Format:</span><span className="font-medium text-gray-700">PDF Document</span></div>
                    <div className="flex justify-between"><span>Upload Date:</span><span className="font-medium text-gray-700">{selectedDocForView.date}</span></div>
                    {selectedDocForView.expiryDate && (
                      <div className="flex justify-between"><span>Expiry Date:</span><span className="font-medium text-gray-700">{selectedDocForView.expiryDate}</span></div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mx-auto">
                    <FileImage size={32} />
                  </div>
                  <div className="space-y-2 max-w-sm mx-auto">
                    <h4 className="font-semibold text-gray-900 text-sm">{selectedDocForView.name} (Image Upload)</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      This image file is securely stored on WorkFlow servers. You can view its metadata below or download it directly to view it on your system.
                    </p>
                  </div>
                  <div className="border-t border-gray-200/50 pt-4 w-full flex flex-col gap-1.5 text-left text-xs text-gray-400">
                    <div className="flex justify-between"><span>File Format:</span><span className="font-medium text-gray-700">Image (JPEG/PNG)</span></div>
                    <div className="flex justify-between"><span>Upload Date:</span><span className="font-medium text-gray-700">{selectedDocForView.date}</span></div>
                    {selectedDocForView.expiryDate && (
                      <div className="flex justify-between"><span>Expiry Date:</span><span className="font-medium text-gray-700">{selectedDocForView.expiryDate}</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setSelectedDocForView(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Close
              </button>
              <button 
                onClick={() => {
                  triggerDownload(selectedDocForView.name);
                  setSelectedDocForView(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}