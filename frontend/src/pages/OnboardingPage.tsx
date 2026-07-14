import { useState } from 'react';
import { useUser } from '../context/UserContext';
import {
  CheckCircle2, Circle, Clock, Calendar, Users, MessageSquare,
  Plane, MapPin, Flag, Award, Play, ChevronDown, ChevronRight,
  Sparkles, User, Phone, Mail, Star,
} from 'lucide-react';
import {
  ONBOARDING_EMPLOYEE, ONBOARDING_TASKS, WELCOME_MESSAGES,
  ONBOARDING_TEAM, RELOCATION_SUPPORT, ONBOARDING_MILESTONES,
} from '../lib/mockData';

const PHASES = ['Pre-Joining', 'Day 1', 'Week 1', 'Week 2', 'Month 1'] as const;

export default function OnboardingPage() {
  const { user } = useUser();
  const [tasks, setTasks] = useState(ONBOARDING_TASKS);
  const [activeTab, setActiveTab] = useState<'tasks' | 'welcome' | 'team' | 'relocation' | 'milestones'>('tasks');
  const [expandedPhase, setExpandedPhase] = useState<string>('Pre-Joining');
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const totalCount = tasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  function toggleTask(id: number) {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, status: t.status === 'Completed' ? 'Not Started' : 'Completed', completedDate: t.status === 'Completed' ? null : new Date().toISOString().split('T')[0] }
        : t
    ));
  }

  if (onboardingComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Onboarding Complete! 🎉</h1>
        <p className="text-gray-500 max-w-md">Welcome to the team, {ONBOARDING_EMPLOYEE.name}! Your onboarding is complete. You'll now be redirected to the standard employee dashboard.</p>
        <a href="/dashboard" className="mt-4 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors">
          Go to Dashboard
        </a>
      </div>
    );
  }

  const tabs = [
    { key: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { key: 'welcome', label: 'Welcome', icon: MessageSquare },
    { key: 'team', label: 'Team', icon: Users },
    { key: 'relocation', label: 'Relocation', icon: Plane },
    { key: 'milestones', label: 'Milestones', icon: Flag },
  ] as const;

  const priorityStyle: Record<string, string> = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-green-100 text-green-700',
  };

  const statusStyle: Record<string, string> = {
    Completed: 'bg-green-100 text-green-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Not Started': 'bg-gray-100 text-gray-500',
  };

  return (
    <div>
      {/* Header with employee info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {ONBOARDING_EMPLOYEE.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">Welcome, {ONBOARDING_EMPLOYEE.name}!</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {ONBOARDING_EMPLOYEE.designation} · {ONBOARDING_EMPLOYEE.department}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
              <span>Manager: <span className="text-gray-600 font-medium">{ONBOARDING_EMPLOYEE.manager}</span></span>
              <span>Buddy: <span className="text-gray-600 font-medium">{ONBOARDING_EMPLOYEE.buddy}</span></span>
              <span>Joining: <span className="text-gray-600 font-medium">{new Date(ONBOARDING_EMPLOYEE.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#0d9488" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(progressPercent / 100) * 175.93} 175.93`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-teal-700">{progressPercent}%</span>
            </div>
            <span className="text-xs text-gray-400">{completedCount}/{totalCount} done</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeTab === t.key ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {PHASES.map(phase => {
            const phaseTasks = tasks.filter(t => t.phase === phase);
            const phaseComplete = phaseTasks.filter(t => t.status === 'Completed').length;
            const isExpanded = expandedPhase === phase;
            return (
              <div key={phase} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedPhase(isExpanded ? '' : phase)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                    <span className="font-semibold text-gray-900">{phase}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{phaseComplete}/{phaseTasks.length}</span>
                  </div>
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-teal-500 transition-all" style={{ width: `${phaseTasks.length ? (phaseComplete / phaseTasks.length) * 100 : 0}%` }} />
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-4 space-y-2">
                    {phaseTasks.map(task => (
                      <div key={task.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                        <button onClick={() => task.assignee === ONBOARDING_EMPLOYEE.name ? toggleTask(task.id) : null} className="mt-0.5 flex-shrink-0">
                          {task.status === 'Completed' ? (
                            <CheckCircle2 size={20} className="text-green-500" />
                          ) : (
                            <Circle size={20} className="text-gray-300 hover:text-teal-400 transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityStyle[task.priority]}`}>{task.priority}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyle[task.status]}`}>{task.status}</span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={10} /> {task.dueDate}</span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1"><User size={10} /> {task.assignee}</span>
                            {task.completedDate && <span className="text-[10px] text-green-500">✓ {task.completedDate}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Welcome Messages Tab */}
      {activeTab === 'welcome' && (
        <div className="space-y-4">
          {WELCOME_MESSAGES.map(msg => (
            <div key={msg.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                  {msg.from.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{msg.from}</p>
                  <p className="text-xs text-gray-400">{msg.role}</p>
                </div>
                {msg.hasVideo && (
                  <button className="ml-auto flex items-center gap-1.5 text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors">
                    <Play size={12} /> Watch Video
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{msg.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Team Introductions Tab */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ONBOARDING_TEAM.map(member => (
            <div key={member.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold">
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.designation}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{member.bio}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {member.expertise.map(skill => (
                  <span key={skill} className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{skill}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400">Fun fact: {member.funFact}</p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${member.introSent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {member.introSent ? '✓ Intro sent' : 'Intro pending'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${member.welcomeSent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {member.welcomeSent ? '✓ Welcome sent' : 'Welcome pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Relocation Support Tab */}
      {activeTab === 'relocation' && (
        <div className="space-y-4">
          {/* Status Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Relocation Status', value: RELOCATION_SUPPORT.status, icon: MapPin, color: 'bg-blue-50 text-blue-600' },
              { label: 'Visa Status', value: RELOCATION_SUPPORT.visaStatus, icon: Flag, color: 'bg-green-50 text-green-600' },
              { label: 'Accommodation', value: RELOCATION_SUPPORT.accommodation.status, icon: MapPin, color: 'bg-purple-50 text-purple-600' },
              { label: 'Travel', value: RELOCATION_SUPPORT.travel.status, icon: Plane, color: 'bg-orange-50 text-orange-600' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                    <Icon size={20} />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Accommodation Details</h3>
              <p className="text-sm text-gray-600">{RELOCATION_SUPPORT.accommodation.details}</p>
              <p className="text-sm text-gray-600 mt-2"><strong>Allowance:</strong> {RELOCATION_SUPPORT.allowance}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Travel Details</h3>
              <p className="text-sm text-gray-600">{RELOCATION_SUPPORT.travel.details}</p>
            </div>
          </div>

          {/* Local Buddy */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Local Buddy</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                {RELOCATION_SUPPORT.localBuddy.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{RELOCATION_SUPPORT.localBuddy.name}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span className="flex items-center gap-1"><Phone size={10} /> {RELOCATION_SUPPORT.localBuddy.phone}</span>
                  <span className="flex items-center gap-1"><Mail size={10} /> {RELOCATION_SUPPORT.localBuddy.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Support Tickets */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Support Tickets</h3>
            <div className="space-y-2">
              {RELOCATION_SUPPORT.tickets.map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm text-gray-700">{ticket.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ticket.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${ticket.status === 'Open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-6">Onboarding Journey (90 Days)</h2>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {ONBOARDING_MILESTONES.map((ms, idx) => (
                <div key={ms.id} className="relative flex gap-4 pl-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10
                    ${ms.type === 'celebration' ? 'bg-yellow-400' : ms.type === 'review' ? 'bg-blue-400' : 'bg-teal-400'}`}>
                    {ms.type === 'celebration' ? <Star size={12} className="text-white" /> :
                     ms.type === 'review' ? <Sparkles size={12} className="text-white" /> :
                     <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{ms.title}</p>
                      <span className="text-[10px] text-gray-400">{new Date(ms.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{ms.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Complete Onboarding Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setOnboardingComplete(true)}
          disabled={progressPercent < 100}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Award size={18} />
          {progressPercent >= 100 ? 'Complete Onboarding' : `Complete all tasks to finish (${progressPercent}%)`}
        </button>
      </div>
    </div>
  );
}
