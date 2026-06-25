'use client';

import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { Receipt, Plus, X, CheckCircle2, XCircle, Clock, Upload } from 'lucide-react';

const EXPENSE_CATEGORIES = ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Training', 'Other'];

const INITIAL_EXPENSES = [
  { id: 1, title: 'Flight to Delhi', category: 'Travel', amount: 8500, date: '2025-06-10', status: 'Approved', receipt: true, employee: 'Sarah Johnson' },
  { id: 2, title: 'Team Lunch', category: 'Food', amount: 2400, date: '2025-06-12', status: 'Pending', receipt: true, employee: 'Sarah Johnson' },
  { id: 3, title: 'Hotel Stay - Mumbai', category: 'Accommodation', amount: 5200, date: '2025-06-08', status: 'Approved', receipt: true, employee: 'Ravi Kumar' },
  { id: 4, title: 'React Conference Ticket', category: 'Training', amount: 3500, date: '2025-06-15', status: 'Pending', receipt: false, employee: 'Sarah Johnson' },
  { id: 5, title: 'Printer Cartridges', category: 'Office Supplies', amount: 1200, date: '2025-06-05', status: 'Rejected', receipt: true, employee: 'Anjali Singh' },
];

export default function ExpensesPage() {
  const { user } = useUser();
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Travel', amount: '', date: '', notes: '' });

  const totalApproved = expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0);
  const totalRejected = expenses.filter(e => e.status === 'Rejected').reduce((s, e) => s + e.amount, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setExpenses([{
      id: expenses.length + 1,
      title: form.title,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      status: 'Pending',
      receipt: false,
      employee: user?.name || 'Me',
    }, ...expenses]);
    setShowModal(false);
    setSuccessMsg(true);
    setForm({ title: '', category: 'Travel', amount: '', date: '', notes: '' });
    setTimeout(() => setSuccessMsg(false), 3000);
  }

  function handleAction(id: number, action: 'Approved' | 'Rejected') {
    setExpenses(expenses.map(e => e.id === id ? { ...e, status: action } : e));
  }

  const statusStyle: Record<string, string> = {
    Approved: 'bg-green-100 text-green-700',
    Pending:  'bg-yellow-100 text-yellow-700',
    Rejected: 'bg-red-100 text-red-700',
  };

  const StatusIcon: Record<string, React.ElementType> = {
    Approved: CheckCircle2,
    Pending: Clock,
    Rejected: XCircle,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">Submit and track your expense claims</p>
        </div>
        {user?.role === 'Employee' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            <Plus size={16} /> Add Expense
          </button>
        )}
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <CheckCircle2 size={16} /> Expense submitted successfully!
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Approved', value: totalApproved, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
          { label: 'Pending',  value: totalPending,  color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100' },
          { label: 'Rejected', value: totalRejected, color: 'bg-red-50 text-red-600', border: 'border-red-100' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl p-5 border shadow-sm ${s.border}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${s.color.split(' ')[1]}`}>{s.label}</p>
            <p className="text-3xl font-bold text-gray-900">₹{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Expense Claims</h2>
          <span className="text-xs text-gray-400">{expenses.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-left">Employee</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Amount</th>
                <th className="px-5 py-3 text-left">Receipt</th>
                <th className="px-5 py-3 text-left">Status</th>
                {(user?.role === 'Manager' || user?.role === 'HR' || user?.role === 'Admin') && (
                  <th className="px-5 py-3 text-left">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map(exp => {
                const Icon = StatusIcon[exp.status];
                return (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{exp.title}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{exp.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{exp.employee}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">₹{exp.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      {exp.receipt
                        ? <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={13} /> Yes</span>
                        : <span className="text-xs text-gray-400">No</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${statusStyle[exp.status]}`}>
                        <Icon size={12} /> {exp.status}
                      </span>
                    </td>
                    {(user?.role === 'Manager' || user?.role === 'HR' || user?.role === 'Admin') && (
                      <td className="px-5 py-3.5">
                        {exp.status === 'Pending' ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleAction(exp.id, 'Approved')}
                              className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                              <CheckCircle2 size={15} />
                            </button>
                            <button onClick={() => handleAction(exp.id, 'Rejected')}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                              <XCircle size={15} />
                            </button>
                          </div>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Add Expense</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" required placeholder="e.g. Flight to Mumbai"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input type="number" required placeholder="0"
                    value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea rows={2} placeholder="Additional details..."
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-teal-400 transition-colors cursor-pointer">
                  <Upload size={20} className="mx-auto text-gray-300 mb-1" />
                  <p className="text-xs text-gray-400">Upload receipt (PDF/Image)</p>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}