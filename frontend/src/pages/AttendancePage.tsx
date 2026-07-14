import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Clock, MapPin, Wifi, CheckCircle2, XCircle, AlertCircle, Calendar, Camera, UserCheck, ShieldCheck, Plus } from 'lucide-react';
import { ATTENDANCE_DATA } from '../lib/mockData';

export default function AttendancePage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'attendance' | 'shift' | 'overtime'>('attendance');
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [showClockModal, setShowClockModal] = useState(false);
  
  // Selfie Verification Simulation
  const [verificationMethod, setVerificationMethod] = useState<'Face' | 'MFA'>('Face');
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [verifyingSelfie, setVerifyingSelfie] = useState(false);

  // Overtime state
  const [overtimeClaims, setOvertimeClaims] = useState([
    { id: 1, date: '2025-06-15', hours: 2.5, rate: 500, description: 'Critical server update release support', status: 'Approved' },
    { id: 2, date: '2025-06-20', hours: 1.5, rate: 500, description: 'Client integration bug fixes', status: 'Pending' },
  ]);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [otForm, setOtForm] = useState({ date: '', hours: '', description: '' });

  const present = ATTENDANCE_DATA.filter(a => a.status === 'Present').length;
  const absent = ATTENDANCE_DATA.filter(a => a.status === 'Absent').length;
  const late = ATTENDANCE_DATA.filter(a => a.status === 'Late').length;
  const halfDay = ATTENDANCE_DATA.filter(a => a.status === 'Half Day').length;

  function triggerClockIn() {
    if (!clockedIn) {
      // Need verification before clocking in
      setShowClockModal(true);
      setSelfieCaptured(false);
      setVerifyingSelfie(false);
    } else {
      // Clocking out is simple
      setClockedIn(false);
      setClockInTime(null);
    }
  }

  function handleVerifyAndClockIn() {
    setVerifyingSelfie(true);
    setTimeout(() => {
      setVerifyingSelfie(false);
      setClockedIn(true);
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setClockInTime(now);
      setShowClockModal(false);
    }, 2000);
  }

  function handleAddOvertime(e: React.FormEvent) {
    e.preventDefault();
    const newClaim = {
      id: overtimeClaims.length + 1,
      date: otForm.date,
      hours: Number(otForm.hours),
      rate: 500,
      description: otForm.description,
      status: 'Pending',
    };
    setOvertimeClaims([newClaim, ...overtimeClaims]);
    setShowOvertimeModal(false);
    setOtForm({ date: '', hours: '', description: '' });
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

  // Dummy June Shift calendar data
  const juneCalendarDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2025-06-${dayNum < 10 ? '0' + dayNum : dayNum}`;
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
    let shift = 'General Shift (9 AM - 6 PM)';
    let isWeekend = false;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      shift = 'Weekend Off';
      isWeekend = true;
    }
    return { day: dayNum, dateStr, shift, isWeekend };
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Track your daily attendance and working hours</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'attendance' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Clock In & Logs
          </button>
          {user?.role === 'Employee' && (
            <>
              <button
                onClick={() => setActiveTab('shift')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'shift' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Shift Calendar
              </button>
              <button
                onClick={() => setActiveTab('overtime')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'overtime' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Overtime Tracker
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'attendance' && (
        <>
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
                      <MapPin size={14} /> Geolocated (Bengaluru HQ)
                    </div>
                    <div className="flex items-center gap-1.5 text-teal-100 text-sm">
                      <Wifi size={14} /> Safe IP (192.168.1.1)
                    </div>
                  </div>
                  {clockedIn && clockInTime && (
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                      <UserCheck size={14} /> Clocked in at {clockInTime}
                    </div>
                  )}
                </div>
                <button
                  onClick={triggerClockIn}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm
                    ${clockedIn ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white text-teal-700 hover:bg-teal-50'}`}
                >
                  <Clock size={18} />
                  {clockedIn ? 'Clock Out' : 'Verify & Clock In'}
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
            <div className="px-5 py-4 border-b border-gray-100 bg-white">
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
                    <th className="px-5 py-3 text-left">Verification Method</th>
                    <th className="px-5 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...ATTENDANCE_DATA].reverse().map((a, i) => (
                    <tr key={a.date} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-700">
                        {new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{a.clockIn || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{a.clockOut || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{a.hours}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-400 font-mono">
                        {a.clockIn ? (i % 2 === 0 ? 'FACIAL_SELFIE' : 'MFA_CODE') : '—'}
                      </td>
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
        </>
      )}

      {activeTab === 'shift' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 text-lg">June 2025 Shift Calendar</h2>
            <div className="flex gap-4 text-xs text-gray-500 font-semibold">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-teal-500 rounded-sm" /> Assigned Shift</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 rounded-sm" /> Weekend Off</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center font-bold text-gray-400 text-xs py-1 border-b border-gray-100">{d}</div>
            ))}
            {/* Pad the start of June 2025 (starts on a Sunday, June 1st is Sunday) */}
            {juneCalendarDays.map(item => (
              <div
                key={item.day}
                className={`border rounded-xl p-2.5 h-20 flex flex-col justify-between transition-all hover:shadow-xs ${
                  item.isWeekend ? 'bg-gray-50 border-gray-100 text-gray-400' : 'bg-teal-50/20 border-teal-100/50 text-teal-800'
                }`}
              >
                <span className="text-xs font-bold">{item.day}</span>
                <span className="text-[10px] font-medium leading-tight truncate">{item.shift}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'overtime' && (
        <div className="space-y-6">
          {/* Overtime Header with apply button */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800 text-lg">Overtime Summary</h2>
              <p className="text-xs text-gray-400 mt-1">Total approved OT: {overtimeClaims.filter(c => c.status === 'Approved').reduce((s, c) => s + c.hours, 0)} hours (Payout: ₹{overtimeClaims.filter(c => c.status === 'Approved').reduce((s, c) => s + c.hours * c.rate, 0).toLocaleString()})</p>
            </div>
            <button
              onClick={() => setShowOvertimeModal(true)}
              className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus size={14} /> Request Overtime
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Overtime Claims</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {overtimeClaims.map(claim => (
                <div key={claim.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">{claim.description}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(claim.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {claim.hours} hours @ ₹{claim.rate}/hr</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-800">₹{(claim.hours * claim.rate).toLocaleString()}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      claim.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Verification Clock In Modal */}
      {showClockModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowClockModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <h3 className="font-bold text-gray-900">Attendance Verification</h3>
              <button onClick={() => setShowClockModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
            </div>

            {/* Verification Method selector */}
            <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => { setVerificationMethod('Face'); setSelfieCaptured(false); }}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-colors ${verificationMethod === 'Face' ? 'bg-white text-teal-700' : 'text-gray-600'}`}
              >
                Face ID (Selfie)
              </button>
              <button
                type="button"
                onClick={() => setVerificationMethod('MFA')}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-colors ${verificationMethod === 'MFA' ? 'bg-white text-teal-700' : 'text-gray-600'}`}
              >
                MFA Passcode
              </button>
            </div>

            {verificationMethod === 'Face' ? (
              <div className="space-y-4">
                <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-gray-700">
                  {verifyingSelfie ? (
                    <div className="absolute inset-0 bg-teal-900/50 flex flex-col items-center justify-center text-teal-100 font-bold text-xs">
                      <ShieldCheck className="animate-bounce" size={28} />
                      <span className="mt-1.5">Analyzing facial geometry...</span>
                    </div>
                  ) : selfieCaptured ? (
                    <div className="absolute inset-0 bg-green-950/40 flex flex-col items-center justify-center text-green-200 text-xs font-semibold">
                      <CheckCircle2 className="text-green-400" size={28} />
                      <span className="mt-1.5">Selfie captured! Ready to check.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 text-xs">
                      <Camera size={24} className="mb-1" />
                      <span>Camera Stream Preview</span>
                    </div>
                  )}
                  {/* Green scanline animation when verifying */}
                  {verifyingSelfie && <div className="absolute left-0 right-0 h-1 bg-green-400 top-0 animate-pulse" />}
                </div>

                {!selfieCaptured ? (
                  <button
                    type="button"
                    onClick={() => setSelfieCaptured(true)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2.5 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Camera size={14} /> Capture Selfie
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelfieCaptured(false)}
                      className="flex-1 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold py-2.5"
                    >
                      Recapture
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyAndClockIn}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold py-2.5"
                    >
                      Verify & Clock In
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Enter 6-digit Authenticator Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    className="w-full text-center tracking-widest text-lg font-bold rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyAndClockIn}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2.5 font-semibold text-xs transition-colors"
                >
                  Verify MFA & Clock In
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overtime Request Modal */}
      {showOvertimeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowOvertimeModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Request Overtime Approval</h3>
              <button onClick={() => setShowOvertimeModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
            </div>
            <form onSubmit={handleAddOvertime} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={otForm.date}
                    onChange={e => setOtForm({ ...otForm, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OT Hours</label>
                  <input
                    type="number"
                    step={0.5}
                    required
                    placeholder="e.g. 2"
                    value={otForm.hours}
                    onChange={e => setOtForm({ ...otForm, hours: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why overtime hours were required..."
                  value={otForm.description}
                  onChange={e => setOtForm({ ...otForm, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowOvertimeModal(false)}
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