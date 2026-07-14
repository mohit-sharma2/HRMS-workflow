import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Calendar, CheckCircle2, XCircle, Clock, Plus, X } from 'lucide-react';
import { LEAVE_BALANCE, LEAVE_REQUESTS } from '../lib/mockData';

export default function LeavePage() {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [requests, setRequests] = useState(LEAVE_REQUESTS);
  const [form, setForm] = useState({ type: 'Casual Leave', from: '', to: '', reason: '' });
  const [successMsg, setSuccessMsg] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newReq = {
      id: requests.length + 1,
      employee: user?.name || 'Me',
      type: form.type,
      from: form.from,
      to: form.to,
      days: 1,
      reason: form.reason,
      status: 'Pending',
    };
    setRequests([newReq, ...requests]);
    setShowModal(false);
    setSuccessMsg(true);
    setForm({ type: 'Casual Leave', from: '', to: '', reason: '' });
    setTimeout(() => setSuccessMsg(false), 3000);
  }

  function handleApprove(id: number, action: 'Approved' | 'Rejected') {
    setRequests(requests.map(r => r.id === id ? { ...r, status: action } : r));
  }

  const statusStyle: Record<string, string> = {
    Pending:  'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  };

  const balanceColors = ['bg-teal-500', 'bg-blue-500', 'bg-orange-500', 'bg-purple-500'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500 text-sm mt-1">Apply and track your leave requests</p>
        </div>
        {user?.role === 'Employee' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            <Plus size={16} /> Apply Leave
          </button>
        )}
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <CheckCircle2 size={16} /> Leave request submitted successfully!
        </div>
      )}

      {/* Leave Balance */}
      {user?.role === 'Employee' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {LEAVE_BALANCE.map((l, i) => (
            <div key={l.type} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500">{l.type}</p>
                <span className="text-xs text-gray-400">{l.remaining}/{l.total}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{l.remaining}</p>
              <p className="text-xs text-gray-400 mb-2">days remaining</p>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${balanceColors[i]}`}
                  style={{ width: `${(l.remaining / l.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {user?.role === 'Employee' ? 'My Leave Requests' : 'Team Leave Requests'}
          </h2>
          <span className="text-xs text-gray-400">{requests.length} requests</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Employee</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">From</th>
                <th className="px-5 py-3 text-left">To</th>
                <th className="px-5 py-3 text-left">Days</th>
                <th className="px-5 py-3 text-left">Reason</th>
                <th className="px-5 py-3 text-left">Status</th>
                {(user?.role === 'Manager' || user?.role === 'HR' || user?.role === 'Admin') && (
                  <th className="px-5 py-3 text-left">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{r.employee}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{r.type}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{r.from}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{r.to}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{r.days}d</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 max-w-xs truncate">{r.reason}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  {(user?.role === 'Manager' || user?.role === 'HR' || user?.role === 'Admin') && (
                    <td className="px-5 py-3.5">
                      {r.status === 'Pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(r.id, 'Approved')}
                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            onClick={() => handleApprove(r.id, 'Rejected')}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Apply for Leave</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {LEAVE_BALANCE.map(l => <option key={l.type}>{l.type}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    required
                    value={form.from}
                    onChange={e => setForm({ ...form, from: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    required
                    value={form.to}
                    onChange={e => setForm({ ...form, to: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  required
                  rows={3}
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="Briefly describe the reason..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}