import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Award, Star, TrendingUp, Trophy, Check, X, ShieldAlert } from 'lucide-react';

const LEADERBOARD = [
  { rank: 1, name: 'Michael Scott',  points: 1240, badge: 'Gold',   dept: 'Engineering', avatar: 'MS' },
  { rank: 2, name: 'Alex Ramirez',   points: 1180, badge: 'Gold',   dept: 'Engineering', avatar: 'AR' },
  { rank: 3, name: 'Anjali Singh',   points: 980,  badge: 'Silver', dept: 'Engineering', avatar: 'AS' },
  { rank: 4, name: 'Ravi Kumar',     points: 870,  badge: 'Silver', dept: 'Engineering', avatar: 'RK' },
  { rank: 5, name: 'Neha Patel',     points: 760,  badge: 'Bronze', dept: 'Engineering', avatar: 'NP' },
  { rank: 6, name: 'Tom Hardy',      points: 620,  badge: 'Bronze', dept: 'Engineering', avatar: 'TH' },
];

const CONTRIBUTION_HISTORY = [
  { id: 1, title: 'Completed React Advanced Training',  points: 150, date: '2025-06-20', category: 'Learning' },
  { id: 2, title: 'Helped 3 teammates with code review', points: 80, date: '2025-06-18', category: 'Team Help' },
  { id: 3, title: 'Zero attendance issues this month',  points: 100, date: '2025-06-15', category: 'Attendance' },
  { id: 4, title: 'Delivered project ahead of deadline', points: 200, date: '2025-06-10', category: 'Delivery' },
  { id: 5, title: 'Submitted expense report on time',    points: 30,  date: '2025-06-05', category: 'Compliance' },
  { id: 6, title: 'Participated in town hall',           points: 50,  date: '2025-06-01', category: 'Engagement' },
];

const BADGES = [
  { name: 'Quick Learner',    icon: '🎓', earned: true,  desc: 'Completed 5 trainings' },
  { name: 'Team Player',      icon: '🤝', earned: true,  desc: 'Helped 10 teammates' },
  { name: 'Punctual Pro',     icon: '⏰', earned: true,  desc: '30 days no late arrival' },
  { name: 'Star Performer',   icon: '⭐', earned: false, desc: 'Top 3 in leaderboard' },
  { name: 'Innovator',        icon: '💡', earned: false, desc: 'Submit 3 new ideas' },
  { name: 'Master Achiever',  icon: '🏆', earned: false, desc: 'Reach 2000 points' },
];

const REWARDS = [
  { id: 1, name: 'Amazon Gift Voucher (₹1,000)', points: 500, icon: '🎫', stock: 12 },
  { id: 2, name: '1 Paid Off Day', points: 1000, icon: '🌴', stock: 5 },
  { id: 3, name: 'WorkFlow Hoody', points: 750, icon: '👕', stock: 3 },
  { id: 4, name: 'Custom Office Chair Upgrade', points: 1500, icon: '🪑', stock: 2 },
];

const categoryColor: Record<string, string> = {
  Learning:   'bg-blue-100 text-blue-700',
  'Team Help':'bg-green-100 text-green-700',
  Attendance: 'bg-teal-100 text-teal-700',
  Delivery:   'bg-purple-100 text-purple-700',
  Compliance: 'bg-orange-100 text-orange-700',
  Engagement: 'bg-pink-100 text-pink-700',
};

const rankColors: Record<number, string> = {
  1: 'bg-yellow-400 text-white',
  2: 'bg-gray-300 text-gray-800',
  3: 'bg-orange-400 text-white',
};

export default function ContributionsPage() {
  const { user } = useUser();
  const [points, setPoints] = useState(1180);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'claim' | 'approvals'>('leaderboard');
  
  const [claims, setClaims] = useState([
    { id: 1, employee: 'Ravi Kumar', reward: 'Amazon Gift Voucher (₹1,000)', points: 500, date: '2025-06-24', status: 'Pending' },
    { id: 2, employee: 'Neha Patel', reward: '1 Paid Off Day', points: 1000, date: '2025-06-23', status: 'Approved' },
  ]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function handleClaim(rewardName: string, rewardPoints: number) {
    if (points < rewardPoints) {
      alert("Insufficient points to claim this reward!");
      return;
    }
    setPoints(prev => prev - rewardPoints);
    const newClaim = {
      id: claims.length + 1,
      employee: user?.name || 'Alex Ramirez',
      reward: rewardName,
      points: rewardPoints,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    setClaims([newClaim, ...claims]);
    setSuccessMsg(`Successfully claimed "${rewardName}"! Request submitted for approval.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  }

  function handleApproval(id: number, approved: boolean) {
    setClaims(prev => prev.map(c => 
      c.id === id 
        ? { ...c, status: approved ? 'Approved' : 'Rejected' } 
        : c
    ));
  }

  const showApprovalsTab = user?.role === 'Manager' || user?.role === 'HR' || user?.role === 'Admin';

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contributions</h1>
          <p className="text-gray-500 text-sm mt-1">Your points, badges and leaderboard ranking</p>
        </div>

        {/* Tab selection */}
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'leaderboard' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Leaderboard & Badges
          </button>
          <button
            onClick={() => setActiveTab('claim')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'claim' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Claim Rewards
          </button>
          {showApprovalsTab && (
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${activeTab === 'approvals' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Approvals
              {claims.filter(c => c.status === 'Pending').length > 0 && (
                <span className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Success Msg Banner */}
      {successMsg && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-semibold text-green-700">
          {successMsg}
        </div>
      )}

      {/* My Stats Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-teal-100 text-sm">Your Total Points</p>
            <p className="text-5xl font-bold mt-1">{points.toLocaleString()}</p>
            <p className="text-teal-100 text-sm mt-1">Rank #2 in your team</p>
          </div>
          <div className="flex gap-4">
            {[
              { label: 'This Month', value: '610' },
              { label: 'Last Month', value: '570' },
              { label: 'Badges', value: '3' },
            ].map(s => (
              <div key={s.label} className="text-center bg-teal-500/40 rounded-xl px-4 py-3">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-teal-100 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'leaderboard' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Leaderboard */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" />
                <h2 className="font-semibold text-gray-900">Team Leaderboard</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {LEADERBOARD.map(member => (
                  <div key={member.rank} className={`flex items-center gap-3 px-5 py-3.5 ${member.name === user?.name || (member.name === 'Alex Ramirez' && user?.role === 'Employee') ? 'bg-teal-50/70' : 'hover:bg-gray-50'} transition-colors`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${rankColors[member.rank] || 'bg-gray-100 text-gray-600'}`}>
                      {member.rank}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${(member.name === user?.name || (member.name === 'Alex Ramirez' && user?.role === 'Employee')) ? 'text-teal-700 font-semibold' : 'text-gray-900'}`}>
                        {member.name} {(member.name === user?.name || (member.name === 'Alex Ramirez' && user?.role === 'Employee')) && '(You)'}
                      </p>
                      <p className="text-xs text-gray-400">{member.dept}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{member.points.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">pts</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
                      ${member.badge === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
                        member.badge === 'Silver' ? 'bg-gray-100 text-gray-600' :
                        'bg-orange-100 text-orange-700'}`}>
                      {member.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Points History */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <TrendingUp size={18} className="text-teal-600" />
                <h2 className="font-semibold text-gray-900">Points History</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {CONTRIBUTION_HISTORY.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[item.category]}`}>
                          {item.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-teal-600 font-bold text-sm flex-shrink-0">
                      <TrendingUp size={14} />
                      +{item.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award size={18} className="text-teal-600" />
              <h2 className="font-semibold text-gray-900">My Badges</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {BADGES.map(badge => (
                <div key={badge.name} className={`rounded-xl p-4 text-center border transition-all
                  ${badge.earned ? 'border-teal-200 bg-teal-50' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <p className={`text-xs font-semibold ${badge.earned ? 'text-teal-700' : 'text-gray-500'}`}>{badge.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{badge.desc}</p>
                  {badge.earned && (
                    <span className="mt-2 inline-block text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full">Earned</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'claim' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Redeem Points for Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {REWARDS.map(reward => {
                const canClaim = points >= reward.points;
                return (
                  <div key={reward.id} className="border border-gray-100 rounded-xl p-4 text-center hover:shadow-md transition-shadow relative">
                    <div className="text-4xl mb-2">{reward.icon}</div>
                    <h3 className="font-bold text-gray-800 text-sm">{reward.name}</h3>
                    <p className="text-xs text-teal-600 font-semibold mt-1">{reward.points} points</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Stock remaining: {reward.stock}</p>
                    <button
                      disabled={!canClaim}
                      onClick={() => handleClaim(reward.name, reward.points)}
                      className={`w-full mt-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        canClaim ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canClaim ? 'Claim Reward' : 'Insufficient Points'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Your Claims History</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {claims.filter(c => c.employee === (user?.name || 'Alex Ramirez')).map(claim => (
                <div key={claim.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">{claim.reward}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{claim.date} · -{claim.points} pts</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    claim.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    claim.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {claim.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && showApprovalsTab && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pending Employee Claims</h2>
            <div className="flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <ShieldAlert size={12} /> HR/Manager Mode
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {claims.map(claim => (
              <div key={claim.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{claim.employee}</span>
                    <span className="text-xs text-gray-400">requested</span>
                  </div>
                  <p className="text-sm text-teal-700 font-medium mt-0.5">{claim.reward}</p>
                  <p className="text-xs text-gray-400 mt-1">{claim.date} · Cost: {claim.points} points</p>
                </div>
                <div>
                  {claim.status === 'Pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproval(claim.id, false)}
                        className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Reject Claim"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={() => handleApproval(claim.id, true)}
                        className="p-1.5 rounded-lg border border-green-200 bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Approve Claim"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      claim.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {claim.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}