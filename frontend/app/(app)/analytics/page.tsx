'use client';

import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { Users, TrendingUp, TrendingDown, Calendar, DollarSign, Target, Clock, CheckCircle2 } from 'lucide-react';

const MONTHLY_ATTENDANCE = [
  { month: 'Jan', present: 88, absent: 8, late: 4 },
  { month: 'Feb', present: 85, absent: 10, late: 5 },
  { month: 'Mar', present: 90, absent: 6, late: 4 },
  { month: 'Apr', present: 87, absent: 9, late: 4 },
  { month: 'May', present: 92, absent: 5, late: 3 },
  { month: 'Jun', present: 89, absent: 7, late: 4 },
];

const DEPT_HEADCOUNT = [
  { dept: 'Engineering',     count: 85, color: 'bg-teal-500' },
  { dept: 'Product',         count: 32, color: 'bg-blue-500' },
  { dept: 'Design',          count: 24, color: 'bg-purple-500' },
  { dept: 'Sales',           count: 48, color: 'bg-orange-500' },
  { dept: 'HR',              count: 18, color: 'bg-pink-500' },
  { dept: 'Finance',         count: 21, color: 'bg-yellow-500' },
  { dept: 'Operations',      count: 20, color: 'bg-green-500' },
];

const LEAVE_TREND = [
  { month: 'Jan', casual: 24, sick: 18, earned: 12 },
  { month: 'Feb', casual: 20, sick: 22, earned: 10 },
  { month: 'Mar', casual: 28, sick: 15, earned: 18 },
  { month: 'Apr', casual: 22, sick: 12, earned: 20 },
  { month: 'May', casual: 18, sick: 10, earned: 25 },
  { month: 'Jun', casual: 26, sick: 14, earned: 15 },
];

const TURNOVER = [
  { month: 'Jan', joined: 8, left: 3 },
  { month: 'Feb', joined: 5, left: 2 },
  { month: 'Mar', joined: 12, left: 4 },
  { month: 'Apr', joined: 6, left: 5 },
  { month: 'May', joined: 9, left: 2 },
  { month: 'Jun', joined: 5, left: 3 },
];

const maxAttendance = Math.max(...MONTHLY_ATTENDANCE.map(m => m.present));
const maxDept = Math.max(...DEPT_HEADCOUNT.map(d => d.count));
const maxLeave = Math.max(...LEAVE_TREND.map(m => m.casual + m.sick + m.earned));
const maxTurnover = Math.max(...TURNOVER.map(m => m.joined + m.left));

export default function AnalyticsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'leave' | 'turnover'>('overview');

  const tabs = [
    { key: 'overview',   label: 'Overview' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'leave',      label: 'Leave' },
    { key: 'turnover',   label: 'Turnover' },
  ] as const;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">HR insights and workforce metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Employees', value: '248',  change: '+5',  up: true,  icon: Users,       color: 'bg-teal-50 text-teal-600' },
          { label: 'Avg Attendance',  value: '88.5%', change: '+2.1%', up: true, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
          { label: 'Monthly Payroll', value: '₹1.8Cr', change: '+3%', up: true,  icon: DollarSign,  color: 'bg-blue-50 text-blue-600' },
          { label: 'Attrition Rate',  value: '3.2%', change: '-0.5%', up: false, icon: TrendingDown, color: 'bg-orange-50 text-orange-600' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-xs font-medium ${s.up ? 'text-green-600' : 'text-red-500'}`}>
                  {s.change}
                </span>
                <span className="text-xs text-gray-400">vs last month</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeTab === t.key ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Department Headcount */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Headcount by Department</h2>
            <div className="space-y-3">
              {DEPT_HEADCOUNT.map(d => (
                <div key={d.dept}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{d.dept}</span>
                    <span className="text-sm font-semibold text-gray-900">{d.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${d.color}`}
                      style={{ width: `${(d.count / maxDept) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 content-start">
            {[
              { label: 'Open Positions',    value: '3',   sub: 'Active job postings',      color: 'border-l-4 border-teal-500' },
              { label: 'Avg Tenure',        value: '2.4y', sub: 'Average employee tenure',  color: 'border-l-4 border-blue-500' },
              { label: 'Training Completion', value: '76%', sub: 'Mandatory trainings done', color: 'border-l-4 border-purple-500' },
              { label: 'Goal Achievement',  value: '68%', sub: 'Avg goal completion',       color: 'border-l-4 border-orange-500' },
              { label: 'New Joiners',       value: '5',   sub: 'This month',               color: 'border-l-4 border-green-500' },
              { label: 'Exits This Month',  value: '3',   sub: 'Resignations + terminations', color: 'border-l-4 border-red-400' },
            ].map(s => (
              <div key={s.label} className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm ${s.color}`}>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs font-medium text-gray-700 mt-0.5">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-6">Monthly Attendance Rate (%)</h2>
          <div className="flex items-end gap-3 h-48">
            {MONTHLY_ATTENDANCE.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-teal-700">{m.present}%</span>
                <div className="w-full flex flex-col gap-0.5" style={{ height: '160px' }}>
                  <div className="w-full bg-green-400 rounded-t-lg"
                    style={{ height: `${(m.present / 100) * 160}px` }} />
                </div>
                <div className="w-full bg-gray-100 rounded-lg flex flex-col overflow-hidden" style={{ height: '24px' }}>
                  <div className="bg-red-300 h-full" style={{ width: `${m.absent}%` }} />
                </div>
                <span className="text-xs text-gray-500">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 justify-center">
            {[
              { label: 'Present', color: 'bg-green-400' },
              { label: 'Absent',  color: 'bg-red-300' },
              { label: 'Late',    color: 'bg-yellow-400' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                <span className="text-xs text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Month</th>
                  <th className="px-4 py-2.5 text-left">Present %</th>
                  <th className="px-4 py-2.5 text-left">Absent %</th>
                  <th className="px-4 py-2.5 text-left">Late %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MONTHLY_ATTENDANCE.map(m => (
                  <tr key={m.month} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{m.month} 2025</td>
                    <td className="px-4 py-2.5 text-sm text-green-600 font-medium">{m.present}%</td>
                    <td className="px-4 py-2.5 text-sm text-red-500">{m.absent}%</td>
                    <td className="px-4 py-2.5 text-sm text-yellow-600">{m.late}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Tab */}
      {activeTab === 'leave' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-6">Leave Trend by Month</h2>
          <div className="flex items-end gap-3 h-48 mb-4">
            {LEAVE_TREND.map(m => {
              const total = m.casual + m.sick + m.earned;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-600">{total}</span>
                  <div className="w-full flex flex-col justify-end rounded-lg overflow-hidden" style={{ height: `${(total / maxLeave) * 160}px` }}>
                    <div className="w-full bg-teal-400" style={{ height: `${(m.casual / total) * 100}%` }} />
                    <div className="w-full bg-blue-400" style={{ height: `${(m.sick / total) * 100}%` }} />
                    <div className="w-full bg-orange-400" style={{ height: `${(m.earned / total) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{m.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 justify-center mb-6">
            {[
              { label: 'Casual', color: 'bg-teal-400' },
              { label: 'Sick',   color: 'bg-blue-400' },
              { label: 'Earned', color: 'bg-orange-400' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                <span className="text-xs text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Month</th>
                  <th className="px-4 py-2.5 text-left">Casual</th>
                  <th className="px-4 py-2.5 text-left">Sick</th>
                  <th className="px-4 py-2.5 text-left">Earned</th>
                  <th className="px-4 py-2.5 text-left">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {LEAVE_TREND.map(m => (
                  <tr key={m.month} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{m.month} 2025</td>
                    <td className="px-4 py-2.5 text-sm text-teal-600">{m.casual}</td>
                    <td className="px-4 py-2.5 text-sm text-blue-600">{m.sick}</td>
                    <td className="px-4 py-2.5 text-sm text-orange-600">{m.earned}</td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-gray-900">{m.casual + m.sick + m.earned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Turnover Tab */}
      {activeTab === 'turnover' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-6">Employee Turnover — Joiners vs Exits</h2>
          <div className="flex items-end gap-4 h-48 mb-4">
            {TURNOVER.map(m => (
              <div key={m.month} className="flex-1 flex items-end gap-1 justify-center">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-green-600 font-semibold">{m.joined}</span>
                  <div
                    className="w-full bg-green-400 rounded-t-lg"
                    style={{ height: `${(m.joined / maxTurnover) * 140}px` }}
                  />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-red-500 font-semibold">{m.left}</span>
                  <div
                    className="w-full bg-red-400 rounded-t-lg"
                    style={{ height: `${(m.left / maxTurnover) * 140}px` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 justify-center mb-2">
            {TURNOVER.map(m => (
              <span key={m.month} className="flex-1 text-center text-xs text-gray-500">{m.month}</span>
            ))}
          </div>
          <div className="flex items-center gap-4 justify-center mt-3 mb-6">
            {[
              { label: 'Joiners', color: 'bg-green-400' },
              { label: 'Exits',   color: 'bg-red-400' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                <span className="text-xs text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Month</th>
                  <th className="px-4 py-2.5 text-left">Joined</th>
                  <th className="px-4 py-2.5 text-left">Left</th>
                  <th className="px-4 py-2.5 text-left">Net Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TURNOVER.map(m => (
                  <tr key={m.month} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{m.month} 2025</td>
                    <td className="px-4 py-2.5 text-sm text-green-600 font-medium">+{m.joined}</td>
                    <td className="px-4 py-2.5 text-sm text-red-500">-{m.left}</td>
                    <td className={`px-4 py-2.5 text-sm font-semibold ${m.joined - m.left >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {m.joined - m.left >= 0 ? '+' : ''}{m.joined - m.left}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}