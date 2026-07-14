import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Users, Search, Mail, Phone, MapPin, Calendar, CheckCircle2, Clock, X, Eye } from 'lucide-react';
import { TEAM_MEMBERS, LEAVE_REQUESTS, ATTENDANCE_DATA } from '../lib/mockData';

const STATUS_STYLE: Record<string, string> = {
  Active:    'bg-green-100 text-green-700',
  'On Leave':'bg-yellow-100 text-yellow-700',
  Inactive:  'bg-red-100 text-red-700',
};

export default function TeamPage() {
  const { user } = useUser();
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<typeof TEAM_MEMBERS[0] | null>(null);
  const [leaveRequests, setLeaveRequests] = useState(LEAVE_REQUESTS);

  const filtered = TEAM_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.designation.toLowerCase().includes(search.toLowerCase())
  );

  const pendingLeaves = leaveRequests.filter(r => r.status === 'Pending');

  function handleLeave(id: number, action: 'Approved' | 'Rejected') {
    setLeaveRequests(leaveRequests.map(r => r.id === id ? { ...r, status: action } : r));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your team members and approve requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Members',  value: TEAM_MEMBERS.length },
          { label: 'Active',         value: TEAM_MEMBERS.filter(m => m.status === 'Active').length },
          { label: 'On Leave',       value: TEAM_MEMBERS.filter(m => m.status === 'On Leave').length },
          { label: 'Pending Approvals', value: pendingLeaves.length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Team Members List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-gray-900 flex-1">Team Members</h2>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                <Search size={14} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent text-sm outline-none text-gray-600 placeholder-gray-400 w-32"
                />
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map(member => (
              <div key={member.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                  <p className="text-xs text-gray-500 truncate">{member.designation}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_STYLE[member.status]}`}>
                  {member.status}
                </span>
                <button
                  onClick={() => setSelectedMember(member)}
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-teal-50 hover:text-teal-600 transition-colors flex-shrink-0"
                >
                  <Eye size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Leave Approvals */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Leave Approvals</h2>
            {pendingLeaves.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                {pendingLeaves.length} pending
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {leaveRequests.map(req => (
              <div key={req.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{req.employee}</p>
                    <p className="text-xs text-gray-500">{req.type} · {req.days} day{req.days > 1 ? 's' : ''}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{req.from} — {req.to}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
                    ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'}`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2 italic">"{req.reason}"</p>
                {req.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLeave(req.id, 'Approved')}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleLeave(req.id, 'Rejected')}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      <X size={13} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMember(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Member Details</h3>
              <button onClick={() => setSelectedMember(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedMember.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{selectedMember.name}</h4>
                  <p className="text-sm text-gray-500">{selectedMember.designation}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium mt-1 inline-block ${STATUS_STYLE[selectedMember.status]}`}>
                    {selectedMember.status}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Users,    label: 'Department', value: selectedMember.department },
                  { icon: Mail,     label: 'Email',      value: selectedMember.email },
                  { icon: Calendar, label: 'Joined',     value: new Date(selectedMember.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={15} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="text-gray-800 font-medium">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}