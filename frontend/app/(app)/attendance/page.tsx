'use client';

import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { Clock, MapPin, Wifi, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { ATTENDANCE_DATA } from '../../../lib/mockData';

export default function AttendancePage() {
  const { user } = useUser();
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const present = ATTENDANCE_DATA.filter(a => a.status === 'Present').length;
  const absent = ATTENDANCE_DATA.filter(a => a.status === 'Absent').length;
  const late = ATTENDANCE_DATA.filter(a => a.status === 'Late').length;
  const halfDay = ATTENDANCE_DATA.filter(a => a.status === 'Half Day').length;

  function handleClock() {
    if (!clockedIn) {
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setClockInTime(now);
      setClockedIn(true);
    } else {
      setClockedIn(false);
    }
    setShowModal(true);
  }

  const statusStyle: Record<string, string> = {
    Present: 'bg-green-100 text-green-700',
    Late: 'bg-yellow-100 text-yellow-700',
    Absent: 'bg-red-100 text-red-700',
    'Half Day': 'bg-blue-100 text-blue-700',
  };

  const stats = [
    { label: 'Present', value: present, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
    { label: 'Absent',  value: absent,  icon: XCircle,      color: 'bg-red-50 text-red-600' },
    { label: 'Late',    value: late,    icon: AlertCircle,  color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Half Day',value: halfDay, icon: Calendar,     color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Track your daily attendance and working hours</p>
      </div>

      {/* Clock In/Out Card */}
      {user?.role === 'Employee' && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-teal-100 text-sm font-medium">Today</p>
              <p className="text-2xl font-bold mt-1">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-teal-100 text-sm">
                  <MapPin size={14} /> Location Verified
                </div>
                <div className="flex items-center gap-1.5 text-teal-100 text-sm">
                  <Wifi size={14} /> IP Validated
                </div>
              </div>
              {clockedIn && clockInTime && (
                <p className="text-teal-100 text-sm mt-2">Clocked in at {clockInTime}</p>
              )}
            </div>
            <button
              onClick={handleClock}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all
                ${clockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-white text-teal-700 hover:bg-teal-50'}`}
            >
              <Clock size={18} />
              {clockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label} days</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Clock In</th>
                <th className="px-5 py-3 text-left">Clock Out</th>
                <th className="px-5 py-3 text-left">Hours</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...ATTENDANCE_DATA].reverse().map((a) => (
                <tr key={a.date} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-gray-700">
                    {new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{a.clockIn || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{a.clockOut || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{a.hours}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${clockedIn ? 'bg-green-100' : 'bg-orange-100'}`}>
              {clockedIn
                ? <CheckCircle2 size={28} className="text-green-600" />
                : <Clock size={28} className="text-orange-600" />}
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900">
              {clockedIn ? 'Clocked In Successfully!' : 'Clocked Out Successfully!'}
            </h3>
            <p className="text-sm text-gray-500 text-center mt-1">
              {clockedIn ? `Time: ${clockInTime}` : 'Your attendance has been recorded.'}
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 bg-teal-600 text-white rounded-xl py-2.5 font-medium text-sm hover:bg-teal-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 'use client';

// import { useEffect, useMemo, useState, type ReactNode } from 'react';
// import {
//   LogIn,
//   LogOut,
//   CalendarCheck2,
//   CalendarX2,
//   CalendarClock,
//   CalendarDays,
//   Search,
//   ChevronDown,
//   Users,
// } from 'lucide-react';
// import { useUser } from '../../../context/UserContext';
// import { ATTENDANCE_DATA, TEAM_MEMBERS } from '../../../lib/mockData';

// type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Half Day';

// const STATUS_STYLES: Record<AttendanceStatus, string> = {
//   Present: 'bg-emerald-50 text-emerald-700',
//   Late: 'bg-amber-50 text-amber-700',
//   Absent: 'bg-red-50 text-red-600',
//   'Half Day': 'bg-blue-50 text-blue-600',
// };

// function formatDate(dateStr: string) {
//   const d = new Date(dateStr);
//   return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
// }

// export default function AttendancePage() {
//   const { user } = useUser();
//   const [now, setNow] = useState(new Date());
//   const [clockedIn, setClockedIn] = useState(false);
//   const [clockInTime, setClockInTime] = useState<string | null>(null);
//   const [statusFilter, setStatusFilter] = useState<'All' | AttendanceStatus>('All');
//   const [query, setQuery] = useState('');

//   useEffect(() => {
//     const timer = setInterval(() => setNow(new Date()), 30_000);
//     return () => clearInterval(timer);
//   }, []);

//   const stats = useMemo(() => {
//     const present = ATTENDANCE_DATA.filter((d) => d.status === 'Present').length;
//     const absent = ATTENDANCE_DATA.filter((d) => d.status === 'Absent').length;
//     const late = ATTENDANCE_DATA.filter((d) => d.status === 'Late').length;
//     const halfDay = ATTENDANCE_DATA.filter((d) => d.status === 'Half Day').length;
//     return { present, absent, late, halfDay, total: ATTENDANCE_DATA.length };
//   }, []);

//   const filteredData = useMemo(() => {
//     return ATTENDANCE_DATA.filter((row) => {
//       const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
//       const matchesQuery = formatDate(row.date).toLowerCase().includes(query.toLowerCase());
//       return matchesStatus && matchesQuery;
//     });
//   }, [statusFilter, query]);

//   function handleClockToggle() {
//     if (!clockedIn) {
//       setClockInTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
//       setClockedIn(true);
//     } else {
//       setClockedIn(false);
//       setClockInTime(null);
//     }
//   }

//   const isManagerView = user?.role === 'Manager' || user?.role === 'HR' || user?.role === 'Admin';

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>
//           <p className="text-sm text-gray-500">Track your work hours and attendance history</p>
//         </div>

//         <button
//           onClick={handleClockToggle}
//           className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors ${
//             clockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-600 hover:bg-teal-700'
//           }`}
//         >
//           {clockedIn ? <LogOut size={16} /> : <LogIn size={16} />}
//           {clockedIn ? `Clock Out · since ${clockInTime}` : 'Clock In'}
//         </button>
//       </div>

//       {/* Stat cards */}
//       <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
//         <StatCard
//           icon={<CalendarCheck2 size={20} className="text-emerald-600" />}
//           bg="bg-emerald-50"
//           label="Present"
//           value={stats.present}
//           sub={`of ${stats.total} days`}
//         />
//         <StatCard
//           icon={<CalendarClock size={20} className="text-amber-600" />}
//           bg="bg-amber-50"
//           label="Late"
//           value={stats.late}
//           sub="check-ins"
//         />
//         <StatCard
//           icon={<CalendarX2 size={20} className="text-red-600" />}
//           bg="bg-red-50"
//           label="Absent"
//           value={stats.absent}
//           sub="days"
//         />
//         <StatCard
//           icon={<CalendarDays size={20} className="text-blue-600" />}
//           bg="bg-blue-50"
//           label="Half Day"
//           value={stats.halfDay}
//           sub="days"
//         />
//       </div>

//       {/* Team attendance — visible to Manager / HR / Admin only */}
//       {isManagerView && (
//         <div className="rounded-2xl border border-gray-100 bg-white p-6">
//           <div className="mb-4 flex items-center gap-2">
//             <Users size={18} className="text-gray-500" />
//             <h2 className="font-semibold text-gray-900">Team Attendance — Today</h2>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-gray-100 text-left text-gray-500">
//                   <th className="py-2 font-medium">Employee</th>
//                   <th className="py-2 font-medium">Designation</th>
//                   <th className="py-2 font-medium">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {TEAM_MEMBERS.map((member, i) => {
//                   const status: AttendanceStatus =
//                     member.status === 'On Leave'
//                       ? 'Absent'
//                       : (ATTENDANCE_DATA[i % ATTENDANCE_DATA.length].status as AttendanceStatus);
//                   return (
//                     <tr key={member.id} className="border-b border-gray-50 last:border-0">
//                       <td className="py-3 text-gray-900">{member.name}</td>
//                       <td className="py-3 text-gray-500">{member.designation}</td>
//                       <td className="py-3">
//                         <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
//                           {status}
//                         </span>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* History table */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-6">
//         <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//           <h2 className="font-semibold text-gray-900">Attendance History</h2>
//           <div className="flex flex-wrap items-center gap-2">
//             <div className="relative">
//               <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search date..."
//                 className="w-40 rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none"
//               />
//             </div>
//             <div className="relative">
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value as 'All' | AttendanceStatus)}
//                 className="appearance-none rounded-lg border border-gray-200 py-2 pl-3 pr-8 text-sm focus:border-teal-500 focus:outline-none"
//               >
//                 <option value="All">All Status</option>
//                 <option value="Present">Present</option>
//                 <option value="Late">Late</option>
//                 <option value="Half Day">Half Day</option>
//                 <option value="Absent">Absent</option>
//               </select>
//               <ChevronDown
//                 size={14}
//                 className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-gray-100 text-left text-gray-500">
//                 <th className="py-2 font-medium">Date</th>
//                 <th className="py-2 font-medium">Clock In</th>
//                 <th className="py-2 font-medium">Clock Out</th>
//                 <th className="py-2 font-medium">Hours</th>
//                 <th className="py-2 font-medium">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredData.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="py-6 text-center text-gray-400">
//                     No records found
//                   </td>
//                 </tr>
//               ) : (
//                 filteredData.map((row) => (
//                   <tr key={row.date} className="border-b border-gray-50 last:border-0">
//                     <td className="py-3 text-gray-900">{formatDate(row.date)}</td>
//                     <td className="py-3 text-gray-500">{row.clockIn || '—'}</td>
//                     <td className="py-3 text-gray-500">{row.clockOut || '—'}</td>
//                     <td className="py-3 text-gray-500">{row.hours}</td>
//                     <td className="py-3">
//                       <span
//                         className={`rounded-full px-2.5 py-1 text-xs font-medium ${
//                           STATUS_STYLES[row.status as AttendanceStatus]
//                         }`}
//                       >
//                         {row.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatCard({
//   icon,
//   bg,
//   label,
//   value,
//   sub,
// }: {
//   icon: ReactNode;
//   bg: string;
//   label: string;
//   value: number;
//   sub: string;
// }) {
//   return (
//     <div className="rounded-2xl border border-gray-100 bg-white p-5">
//       <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>{icon}</div>
//       <p className="text-2xl font-semibold text-gray-900">{value}</p>
//       <p className="text-sm text-gray-500">{label}</p>
//       <p className="text-xs text-gray-400">{sub}</p>
//     </div>
//   );
// }