import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { DollarSign, Download, TrendingUp, TrendingDown, Eye, X, Globe, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PAYSLIPS } from '../lib/mockData';

export default function PayrollPage() {
  const { user } = useUser();
  const [selectedSlip, setSelectedSlip] = useState<typeof PAYSLIPS[0] | null>(null);
  const [country, setCountry] = useState<'India' | 'US'>('India');
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const isHR = user?.role === 'HR' || user?.role === 'Admin';
  const latest = PAYSLIPS[0];

  // Convert values if USD is toggled (e.g., 1 USD = 80 INR for demo simulation)
  const rate = country === 'India' ? 1 : 1 / 83.5;
  const currencySymbol = country === 'India' ? '₹' : '$';

  const formatAmt = (val: number) => {
    const amt = val * rate;
    return currencySymbol + (country === 'India' 
      ? Math.round(amt).toLocaleString('en-IN')
      : amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  function handleDownload(month: string) {
    setDownloadMsg(`Generating & downloading PDF payslip for ${month}...`);
    
    const slip = PAYSLIPS.find(p => p.month === month) || PAYSLIPS[0];
    
    const basicAmt = formatAmt(slip.basic);
    const hraAmt = formatAmt(slip.hra);
    const daAmt = formatAmt(slip.da);
    const pfAmt = formatAmt(slip.pf);
    const esiAmt = formatAmt(slip.esi);
    const tdsAmt = formatAmt(slip.tds);
    const grossAmt = formatAmt(slip.basic + slip.hra + slip.da);
    const deductAmt = formatAmt(slip.pf + slip.esi + slip.tds);
    const netAmt = formatAmt(slip.net);

    const fileContent = `==================================================
              WORKFLOW HRMS PAYSLIP              
==================================================
Month:            ${month}
Employee Name:    ${user?.name ?? 'Employee'}
Employee ID:      ${user?.employeeId ?? 'N/A'}
Designation:      ${user?.designation ?? 'N/A'}
Department:       ${user?.department ?? 'N/A'}
--------------------------------------------------
EARNINGS
--------------------------------------------------
Basic Salary:     ${basicAmt}
HRA:              ${hraAmt}
DA:               ${daAmt}
--------------------------------------------------
Gross Earnings:   ${grossAmt}
--------------------------------------------------
DEDUCTIONS
--------------------------------------------------
Provident Fund:   ${pfAmt}
ESI:              ${esiAmt}
TDS (Tax):        ${tdsAmt}
--------------------------------------------------
Total Deductions: -${deductAmt}
--------------------------------------------------
NET TAKE HOME:    ${netAmt}
--------------------------------------------------
Status:           ${slip.status} (Paid)
==================================================
   Generated securely on ${new Date().toLocaleDateString()}   
==================================================`;

    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Payslip_${month.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => {
      setDownloadMsg(null);
    }, 2000);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-500 text-sm mt-1">View your salary details and payslips</p>
        </div>

        {/* India vs US Toggle */}
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200 self-start">
          <Globe size={14} className="text-gray-400 ml-2" />
          <button
            onClick={() => setCountry('India')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              country === 'India' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            India (INR)
          </button>
          <button
            onClick={() => setCountry('US')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              country === 'US' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            US (USD)
          </button>
        </div>
      </div>

      {/* Download Alert toast */}
      {downloadMsg && (
        <div className="mb-4 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex items-center gap-2 text-teal-700 text-sm font-semibold animate-pulse">
          <Download size={16} /> {downloadMsg}
        </div>
      )}

      {/* Salary Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Basic Salary',  value: formatAmt(latest.basic),  icon: DollarSign,   color: 'bg-teal-50 text-teal-600' },
          { label: 'HRA',           value: formatAmt(latest.hra),     icon: TrendingUp,   color: 'bg-blue-50 text-blue-600' },
          { label: 'Deductions',    value: formatAmt(latest.pf + latest.tds + latest.esi), icon: TrendingDown, color: 'bg-red-50 text-red-600' },
          { label: 'Net Take-Home', value: formatAmt(latest.net),     icon: DollarSign,   color: 'bg-green-50 text-green-600' },
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
                <span className="text-sm font-medium text-gray-900">{formatAmt(item.value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-semibold text-gray-900">Gross Earnings</span>
              <span className="text-sm font-bold text-teal-600">{formatAmt(latest.basic + latest.hra + latest.da)}</span>
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
                <span className="text-sm font-medium text-red-600">-{formatAmt(item.value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-semibold text-gray-900">Total Deductions</span>
              <span className="text-sm font-bold text-red-500">-{formatAmt(latest.pf + latest.esi + latest.tds)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Pay Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
        <div>
          <p className="text-teal-100 text-sm">Net Take Home — {latest.month} ({country} Payroll)</p>
          <p className="text-4xl font-bold mt-1">{formatAmt(latest.net)}</p>
        </div>
        <button
          onClick={() => handleDownload(latest.month)}
          className="flex items-center gap-2 bg-white text-teal-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-colors"
        >
          <Download size={16} /> Download Payslip (PDF)
        </button>
      </div>

      {/* Compliance Section (Admin & HR only) */}
      {isHR && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-teal-600" size={18} />
              <h2 className="font-semibold text-gray-900">Compliance & Regulatory Filing</h2>
            </div>
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
              HR/Admin Portal
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
              <p className="text-xs text-gray-400 font-semibold uppercase">EPF Compliance (India)</p>
              <p className="text-lg font-bold text-gray-800 mt-1">100% Filed</p>
              <div className="flex items-center gap-1.5 text-xs text-green-600 mt-2">
                <CheckCircle2 size={13} />
                <span>EPF ECR filed for May 2025</span>
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
              <p className="text-xs text-gray-400 font-semibold uppercase">Tax Filing Form 24Q</p>
              <p className="text-lg font-bold text-gray-800 mt-1">Q1 Completed</p>
              <div className="flex items-center gap-1.5 text-xs text-green-600 mt-2">
                <CheckCircle2 size={13} />
                <span>TDS return submitted cleanly</span>
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
              <p className="text-xs text-gray-400 font-semibold uppercase">US Compliance (W-2/1099)</p>
              <p className="text-lg font-bold text-gray-800 mt-1">Ready for FY 2025</p>
              <div className="flex items-center gap-1.5 text-xs text-green-600 mt-2">
                <CheckCircle2 size={13} />
                <span>941 quarterly returns generated</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <td className="px-5 py-3.5 text-sm text-gray-600">{formatAmt(p.basic)}</td>
                  <td className="px-5 py-3.5 text-sm text-red-500">-{formatAmt(p.pf + p.esi + p.tds)}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{formatAmt(p.net)}</td>
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
                        title="View Breakdown"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleDownload(p.month)}
                        className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                        title="Download Payslip"
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
                { label: 'Basic Salary', value: formatAmt(selectedSlip.basic), type: 'earn' },
                { label: 'HRA', value: formatAmt(selectedSlip.hra), type: 'earn' },
                { label: 'DA', value: formatAmt(selectedSlip.da), type: 'earn' },
                { label: 'PF Deduct', value: `-${formatAmt(selectedSlip.pf)}`, type: 'deduct' },
                { label: 'ESI Deduct', value: `-${formatAmt(selectedSlip.esi)}`, type: 'deduct' },
                { label: 'TDS Deduct', value: `-${formatAmt(selectedSlip.tds)}`, type: 'deduct' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className={item.type === 'deduct' ? 'text-red-500 font-medium' : 'text-gray-900 font-medium'}>
                    {item.value}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Net Take-Home</span>
                <span className="font-bold text-teal-600 text-lg">{formatAmt(selectedSlip.net)}</span>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => {
                  setSelectedSlip(null);
                  handleDownload(selectedSlip.month);
                }}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700"
              >
                <Download size={16} /> Download Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}