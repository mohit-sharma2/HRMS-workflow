import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import {
  Clock, Calendar, DollarSign, Target, Users,
  TrendingUp, CheckCircle2, AlertCircle, ArrowRight, Sun, Sunset, Moon,
} from 'lucide-react';
import { ATTENDANCE_DATA, LEAVE_BALANCE, GOALS, TEAM_MEMBERS, ANNOUNCEMENTS } from '../lib/mockData';

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const [clockedIn, setClockedIn] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (!isLoading && !user) navigate('/login', { replace: true });
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (isLoading || !user) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin w-8 h-8 rounded-full border-4 border-teal-600 border-t-transparent" />
    </div>
  );

  const hour = time.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Sunset : Moon;

  const presentDays = ATTENDANCE_DATA.filter(a => a.status === 'Present').length;

  const statsForRole = () => {
    if (user.role === 'Employee') return [
      { label: 'Present This Month', value: `${presentDays}/22`, icon: CheckCircle2, color: 'teal', sub: 'Working days' },
      { label: 'Leave Balance', value: '18 days', icon: Calendar, color: 'blue', sub: 'Remaining' },
      { label: 'Net Salary', value: '59,250', icon: DollarSign, color: 'green', sub: 'May 2025' },
      { label: 'Goals Progress', value: '66%', icon: Target, color: 'orange', sub: 'Avg completion' },
    ];
    if (user.role === 'Manager') return [
      { label: 'Team Members', value: `${TEAM_MEMBERS.length}`, icon: Users, color: 'teal', sub: 'Direct reports' },
      { label: 'Pending Approvals', value: '3', icon: AlertCircle, color: 'orange', sub: 'Leave requests' },
      { label: 'Team Attendance', value: '87%', icon: CheckCircle2, color: 'green', sub: 'Today' },
      { label: 'Team Goals', value: '72%', icon: Target, color: 'blue', sub: 'Avg completion' },
    ];
    if (user.role === 'HR') return [
      { label: 'Total Employees', value: '248', icon: Users, color: 'teal', sub: 'Active' },
      { label: 'Open Positions', value: '3', icon: TrendingUp, color: 'orange', sub: 'Jobs posted' },
      { label: 'New Joiners', value: '5', icon: CheckCircle2, color: 'green', sub: 'This month' },
      { label: 'Pending Leaves', value: '8', icon: Calendar, color: 'blue', sub: 'To review' },
    ];
    return [
      { label: 'Total Employees', value: '248', icon: Users, color: 'teal', sub: 'Active' },
      { label: 'Departments', value: '12', icon: TrendingUp, color: 'blue', sub: 'Active' },
      { label: 'Monthly Payroll', value: '1.8Cr', icon: DollarSign, color: 'green', sub: 'Processed' },
      { label: 'Pending Tasks', value: '11', icon: AlertCircle, color: 'orange', sub: 'Need action' },
    ];
  };

  const colorMap: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
   <div>
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <GreetIcon size={20} className="text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {user.name.split(' ')[0]}!
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {time.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Clock In/Out — only Employee */}
        {user.role === 'Employee' && (
          <button
            onClick={() => setClockedIn(!clockedIn)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm
              ${clockedIn
                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                : 'bg-teal-600 text-white hover:bg-teal-700'}`}
          >
            <Clock size={16} />
            {clockedIn ? 'Clock Out' : 'Clock In'}
            {!clockedIn && (
              <span className="text-teal-200 text-xs">
                {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsForRole().map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[stat.color]}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
              <p className="text-xs font-medium text-gray-600 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Attendance */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Attendance</h2>
            <a href="/attendance" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </a>
          </div>
          <div className="space-y-2">
            {ATTENDANCE_DATA.slice(-5).reverse().map((a) => (
              <div key={a.date} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">
                  {new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{a.clockIn || '--'} — {a.clockOut || '--'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${a.status === 'Present' ? 'bg-green-100 text-green-700' :
                      a.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                      a.status === 'Absent' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'}`}>
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Announcements</h2>
            <a href="/announcements" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </a>
          </div>
          <div className="space-y-3">
            {ANNOUNCEMENTS.slice(0, 3).map((a) => (
              <div key={a.id} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0">
                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0
                  ${a.priority === 'High' ? 'bg-red-400' : a.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'}`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.category} · {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        {(user.role === 'Employee' || user.role === 'Manager') && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">My Goals</h2>
              <a href="/performance" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </a>
            </div>
            <div className="space-y-3">
              {GOALS.map((g) => (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 truncate mr-2">{g.title}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0
                      ${g.status === 'On Track' ? 'bg-green-100 text-green-700' :
                        g.status === 'At Risk' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'}`}>
                      {g.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${g.status === 'At Risk' ? 'bg-red-400' : 'bg-teal-500'}`}
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{g.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leave Balance */}
        {user.role === 'Employee' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Leave Balance</h2>
              <a href="/leave" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                Apply <ArrowRight size={12} />
              </a>
            </div>
            <div className="space-y-3">
              {LEAVE_BALANCE.map((l) => (
                <div key={l.type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{l.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-teal-500"
                        style={{ width: `${(l.remaining / l.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-14 text-right">
                      {l.remaining}/{l.total} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    
  );
}
