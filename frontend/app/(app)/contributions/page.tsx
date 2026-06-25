'use client';

import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { Award, Star, TrendingUp, Users, Trophy, ThumbsUp } from 'lucide-react';

const LEADERBOARD = [
  { rank: 1, name: 'Michael Scott',  points: 1240, badge: 'Gold',   dept: 'Engineering', avatar: 'MS' },
  { rank: 2, name: 'Sarah Johnson',  points: 1180, badge: 'Gold',   dept: 'Engineering', avatar: 'SJ' },
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
  const myPoints = 1180;
  const myRank = 2;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contributions</h1>
        <p className="text-gray-500 text-sm mt-1">Your points, badges and leaderboard ranking</p>
      </div>

      {/* My Stats Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-teal-100 text-sm">Your Total Points</p>
            <p className="text-5xl font-bold mt-1">{myPoints.toLocaleString()}</p>
            <p className="text-teal-100 text-sm mt-1">Rank #{myRank} in your team</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Leaderboard */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" />
            <h2 className="font-semibold text-gray-900">Team Leaderboard</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {LEADERBOARD.map(member => (
              <div key={member.rank} className={`flex items-center gap-3 px-5 py-3.5 ${member.name === user?.name ? 'bg-teal-50' : 'hover:bg-gray-50'} transition-colors`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${rankColors[member.rank] || 'bg-gray-100 text-gray-600'}`}>
                  {member.rank}
                </div>
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${member.name === user?.name ? 'text-teal-700' : 'text-gray-900'}`}>
                    {member.name} {member.name === user?.name && '(You)'}
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
    </div>
  );
}