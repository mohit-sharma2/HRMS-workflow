'use client';

import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { DollarSign, Download, TrendingUp, TrendingDown, Eye, X } from 'lucide-react';
import { PAYSLIPS } from '../../../lib/mockData';

export default function PayrollPage() {
  const { user } = useUser();
  const [selectedSlip, setSelectedSlip] = useState<typeof PAYSLIPS[0] | null>(null);

  const latest = PAYSLIPS[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        <p className="text-gray-500 text-sm mt-1">View your salary details and payslips</p>
      </div>

      {/* Salary Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Basic Salary',  value: `₹${latest.basic.toLocaleString()}`,  icon: DollarSign,   color: 'bg-teal-50 text-teal-600' },
          { label: 'HRA',           value: `₹${latest.hra.toLocaleString()}`,     icon: TrendingUp,   color: 'bg-blue-50 text-blue-600' },
          { label: 'Deductions',    value: `₹${(latest.pf + latest.tds + latest.esi).toLocaleString()}`, icon: TrendingDown, color: 'bg-red-50 text-red-600' },
          { label: 'Net Pay',       value: `₹${latest.net.toLocaleString()}`,     icon: DollarSign,   color: 'bg-green-50 text-green-600' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Latest Payslip Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Earnings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Earnings — {latest.month}</h2>
          <div className="space-y-3">
            {[
              { label: 'Basic Salary', value: latest.basic },
              { label: 'House Rent Allowance (HRA)', value: latest.hra },
              { label: 'Dearness Allowance (DA)', value: latest.da },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-semibold text-gray-900">Gross Earnings</span>
              <span className="text-sm font-bold text-teal-600">₹{(latest.basic + latest.hra + latest.da).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Deductions — {latest.month}</h2>
          <div className="space-y-3">
            {[
              { label: 'Provident Fund (PF)', value: latest.pf },
              { label: 'ESI', value: latest.esi },
              { label: 'Tax Deducted at Source (TDS)', value: latest.tds },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-medium text-red-600">-₹{item.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-semibold text-gray-900">Total Deductions</span>
              <span className="text-sm font-bold text-red-500">-₹{(latest.pf + latest.esi + latest.tds).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Pay Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 mb-6 flex items-center justify-between text-white">
        <div>
          <p className="text-teal-100 text-sm">Net Take Home — {latest.month}</p>
          <p className="text-4xl font-bold mt-1">₹{latest.net.toLocaleString()}</p>
        </div>
        <button className="flex items-center gap-2 bg-white text-teal-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-colors">
          <Download size={16} /> Download Payslip
        </button>
      </div>

      {/* Payslip History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Payslip History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Month</th>
                <th className="px-5 py-3 text-left">Basic</th>
                <th className="px-5 py-3 text-left">Deductions</th>
                <th className="px-5 py-3 text-left">Net Pay</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PAYSLIPS.map((p) => (
                <tr key={p.month} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{p.month}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">₹{p.basic.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm text-red-500">-₹{(p.pf + p.esi + p.tds).toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">₹{p.net.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSlip(p)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="View"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                        title="Download"
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Detail Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSlip(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Payslip — {selectedSlip.month}</h3>
              <button onClick={() => setSelectedSlip(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: 'Basic Salary', value: `₹${selectedSlip.basic.toLocaleString()}`, type: 'earn' },
                { label: 'HRA', value: `₹${selectedSlip.hra.toLocaleString()}`, type: 'earn' },
                { label: 'DA', value: `₹${selectedSlip.da.toLocaleString()}`, type: 'earn' },
                { label: 'PF', value: `-₹${selectedSlip.pf.toLocaleString()}`, type: 'deduct' },
                { label: 'ESI', value: `-₹${selectedSlip.esi.toLocaleString()}`, type: 'deduct' },
                { label: 'TDS', value: `-₹${selectedSlip.tds.toLocaleString()}`, type: 'deduct' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className={item.type === 'deduct' ? 'text-red-500 font-medium' : 'text-gray-900 font-medium'}>
                    {item.value}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Net Pay</span>
                <span className="font-bold text-teal-600 text-lg">₹{selectedSlip.net.toLocaleString()}</span>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700">
                <Download size={16} /> Download Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}