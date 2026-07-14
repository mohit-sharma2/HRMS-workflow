import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Receipt, Plus, X, CheckCircle2, XCircle, Clock, Upload, ArrowRight, Calculator } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'claims' | 'mileage' | 'tracker'>('claims');
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Expense Form State
  const [form, setForm] = useState({ title: '', category: 'Travel', amount: '', date: '', notes: '' });
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string | null>(null);

  // Mileage Calculator State
  const [mileage, setMileage] = useState({ title: 'Client Visit Mileage', distance: '', vehicle: 'Car', calculatedAmount: 0 });

  const totalApproved = expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0);
  const totalRejected = expenses.filter(e => e.status === 'Rejected').reduce((s, e) => s + e.amount, 0);

  function handleFileChange() {
    // Simulate receipt upload
    setUploadedReceiptName('receipt_invoice_104.pdf');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setExpenses([{
      id: expenses.length + 1,
      title: form.title,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      status: 'Pending',
      receipt: !!uploadedReceiptName,
      employee: user?.name || 'Alex Ramirez',
    }, ...expenses]);
    setShowModal(false);
    setSuccessMsg('Expense claim submitted successfully for manager approval!');
    setForm({ title: '', category: 'Travel', amount: '', date: '', notes: '' });
    setUploadedReceiptName(null);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  // Handle Mileage Submit
  function handleMileageSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rate = mileage.vehicle === 'Car' ? 12 : 6; // ₹12/km for car, ₹6/km for bike
    const calculated = Number(mileage.distance) * rate;
    
    setExpenses([{
      id: expenses.length + 1,
      title: mileage.title + ` (${mileage.distance} km)`,
      category: 'Travel',
      amount: calculated,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      receipt: true, // Log receipt from calculator
      employee: user?.name || 'Alex Ramirez',
    }, ...expenses]);

    setSuccessMsg(`Mileage expense of ₹${calculated} (distance: ${mileage.distance} km) submitted!`);
    setMileage({ title: 'Client Visit Mileage', distance: '', vehicle: 'Car', calculatedAmount: 0 });
    setActiveTab('claims');
    setTimeout(() => setSuccessMsg(null), 3000);
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

  const ratePerKm = mileage.vehicle === 'Car' ? 12 : 6;
  const calculatedMileageAmount = mileage.distance ? Number(mileage.distance) * ratePerKm : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">Submit and track your expense claims</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'claims' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Claims
          </button>
          {user?.role === 'Employee' && (
            <>
              <button
                onClick={() => setActiveTab('mileage')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'mileage' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Mileage Calculator
              </button>
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'tracker' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Reimbursement Tracker
              </button>
            </>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-semibold">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {activeTab === 'claims' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Approved Claims', value: totalApproved, color: 'bg-green-50 text-green-600 border-green-100' },
              { label: 'Pending Approval',  value: totalPending,  color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
              { label: 'Rejected Claims', value: totalRejected, color: 'bg-red-50 text-red-600 border-red-100' },
            ].map(s => (
              <div key={s.label} className={`bg-white rounded-xl p-5 border shadow-sm ${s.color.split(' ')[2]}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${s.color.split(' ')[1]}`}>{s.label}</p>
                <p className="text-3xl font-bold text-gray-900">₹{s.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Expense Actions bar */}
          {user?.role === 'Employee' && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                <Plus size={16} /> Add Expense
              </button>
            </div>
          )}

          {/* Expense List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
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
                            ? <span className="text-xs text-green-600 flex items-center gap-1 font-semibold"><CheckCircle2 size={13} /> Yes</span>
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
                                  className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                  title="Approve">
                                  <CheckCircle2 size={15} />
                                </button>
                                <button onClick={() => handleAction(exp.id, 'Rejected')}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                  title="Reject">
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
        </>
      )}

      {activeTab === 'mileage' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="text-teal-600" size={20} />
            <h2 className="font-semibold text-gray-900 text-lg">Mileage Calculator & Claim</h2>
          </div>
          <form onSubmit={handleMileageSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expense Title</label>
              <input
                type="text"
                required
                value={mileage.title}
                onChange={e => setMileage({ ...mileage, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select
                  value={mileage.vehicle}
                  onChange={e => setMileage({ ...mileage, vehicle: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Car">Car (₹12 / km)</option>
                  <option value="Bike">Bike (₹6 / km)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50"
                  value={mileage.distance}
                  onChange={e => setMileage({ ...mileage, distance: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {mileage.distance && (
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-center">
                <p className="text-xs text-teal-600 font-semibold uppercase tracking-wide">Calculated Amount</p>
                <p className="text-3xl font-bold text-teal-700 mt-1">₹{calculatedMileageAmount.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Formula: {mileage.distance} km × ₹{ratePerKm}/km</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              Submit Mileage Claim
            </button>
          </form>
        </div>
      )}

      {activeTab === 'tracker' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl mx-auto">
          <h2 className="font-semibold text-gray-900 text-lg mb-6">Reimbursement Stage Tracker</h2>
          <div className="space-y-8">
            {[
              { id: 1, name: 'Flight to Delhi (₹8,500)', date: '2025-06-10', stage: 4, statusText: 'Reimbursement disbursed to bank account' },
              { id: 3, name: 'Hotel Stay - Mumbai (₹5,200)', date: '2025-06-08', stage: 3, statusText: 'Approved by Manager, scheduled for next payroll cycle' },
            ].map(track => (
              <div key={track.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{track.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Submitted on {track.date}</p>
                  </div>
                  <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{track.statusText}</span>
                </div>

                {/* Progress Stepper */}
                <div className="grid grid-cols-4 gap-2 text-center mt-4">
                  {[
                    { step: 1, label: 'Submitted' },
                    { step: 2, label: 'Verified' },
                    { step: 3, label: 'Approved' },
                    { step: 4, label: 'Paid' },
                  ].map(s => {
                    const isActive = track.stage >= s.step;
                    return (
                      <div key={s.step} className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isActive ? 'bg-teal-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isActive ? '✓' : s.step}
                        </div>
                        <p className={`text-[10px] font-semibold mt-1 ${isActive ? 'text-teal-700 font-bold' : 'text-gray-400'}`}>{s.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <div onClick={handleFileChange} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-teal-400 transition-colors cursor-pointer bg-gray-50/50">
                  <Upload size={20} className="mx-auto text-gray-300 mb-1" />
                  <p className="text-xs text-gray-500">{uploadedReceiptName || 'Upload receipt (PDF/Image)'}</p>
                  {uploadedReceiptName && <p className="text-[10px] text-green-600 font-semibold mt-1">✓ Click to change</p>}
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