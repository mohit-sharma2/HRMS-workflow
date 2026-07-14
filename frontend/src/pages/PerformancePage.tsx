import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Target, Plus, X, TrendingUp, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronRight, Award, MessageSquare, Star } from 'lucide-react';
import { GOALS } from '../lib/mockData';

const GOAL_CATEGORIES = ['Individual', 'Team', 'Departmental'];
const GOAL_TYPES = ['Quarterly', 'Annual'];

// Define mock Key Results for each goal
const INITIAL_KEY_RESULTS: Record<number, { id: number; title: string; target: string; current: string; progress: number }[]> = {
  1: [
    { id: 101, title: 'Complete Next.js Turbopack setup and routing', target: '100%', current: '100%', progress: 100 },
    { id: 102, title: 'Implement all 15 functional modules with mock data', target: '15 modules', current: '15 modules', progress: 100 },
    { id: 103, title: 'Ensure zero compilation warnings/errors in build', target: '0 errors', current: '0 errors', progress: 100 },
  ],
  2: [
    { id: 201, title: 'Publish 5 advanced guides on frontend micro-interactions', target: '5 articles', current: '3 articles', progress: 60 },
    { id: 202, title: 'Conduct weekly pair-programming knowledge transfer sessions', target: '4 sessions', current: '4 sessions', progress: 100 },
  ],
  3: [
    { id: 301, title: 'Deploy automatic ESLint and Prettier rules in CI/CD pipeline', target: '100% active', current: '100% active', progress: 100 },
    { id: 302, title: 'Refactor commented-out legacy code in 6 core client pages', target: '6 files', current: '4 files', progress: 66 },
  ]
};

export default function PerformancePage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'goals' | 'reviews'>('goals');
  const [goals, setGoals] = useState(GOALS);
  const [keyResults, setKeyResults] = useState(INITIAL_KEY_RESULTS);
  const [expandedGoal, setExpandedGoal] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  
  const [form, setForm] = useState({ title: '', category: 'Individual', type: 'Quarterly', dueDate: '', weight: '25' });

  const avgProgress = Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newId = goals.length + 1;
    setGoals([{
      id: newId,
      title: form.title,
      category: form.category,
      type: form.type,
      progress: 0,
      status: 'In Progress',
      dueDate: form.dueDate,
      weight: Number(form.weight),
    }, ...goals]);
    
    // Add default Key Results for new goal
    setKeyResults({
      ...keyResults,
      [newId]: [
        { id: newId * 100 + 1, title: `Define milestone criteria for ${form.title}`, target: '100%', current: '0%', progress: 0 },
        { id: newId * 100 + 2, title: `Complete phase 1 implementation`, target: '100%', current: '0%', progress: 0 }
      ]
    });

    setShowModal(false);
    setSuccessMsg(true);
    setForm({ title: '', category: 'Individual', type: 'Quarterly', dueDate: '', weight: '25' });
    setTimeout(() => setSuccessMsg(false), 3000);
  }

  const statusStyle: Record<string, string> = {
    'On Track':    'bg-green-100 text-green-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'At Risk':     'bg-red-100 text-red-700',
    'Completed':   'bg-teal-100 text-teal-700',
  };

  const StatusIcon: Record<string, React.ElementType> = {
    'On Track':    CheckCircle2,
    'In Progress': Clock,
    'At Risk':     AlertCircle,
    'Completed':   CheckCircle2,
  };

  const progressColor = (status: string) => {
    if (status === 'At Risk') return 'bg-red-400';
    if (status === 'Completed') return 'bg-teal-500';
    if (status === 'On Track') return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance & Goals</h1>
          <p className="text-gray-500 text-sm mt-1">Track your OKRs and performance reviews</p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'goals' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            My OKRs & Goals
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'reviews' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Performance Reviews
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <CheckCircle2 size={16} /> Goal added successfully!
        </div>
      )}

      {activeTab === 'goals' && (
        <>
          {/* Overall Progress Banner */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-teal-100 text-sm">Overall Goal Completion</p>
                <p className="text-5xl font-bold mt-1">{avgProgress}%</p>
                <p className="text-teal-100 text-sm mt-1">{goals.length} active goals</p>
              </div>
              <div className="w-full sm:w-48">
                <div className="w-full bg-teal-500 rounded-full h-3">
                  <div className="h-3 rounded-full bg-white transition-all duration-300" style={{ width: `${avgProgress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-teal-200 mt-1">
                  <span>0%</span><span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Add Goal Trigger */}
          {user?.role === 'Employee' && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                <Plus size={16} /> Add Goal
              </button>
            </div>
          )}

          {/* Goals List */}
          <div className="space-y-4">
            {goals.map(goal => {
              const Icon = StatusIcon[goal.status] || Clock;
              const isExpanded = expandedGoal === goal.id;
              const krs = keyResults[goal.id] || [];

              return (
                <div key={goal.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{goal.category}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{goal.type}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>Due: {new Date(goal.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>Weight: {goal.weight}%</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 flex-shrink-0 w-fit ${statusStyle[goal.status]}`}>
                      <Icon size={12} /> {goal.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-sm font-bold text-gray-900">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${progressColor(goal.status)}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Toggle Key Results */}
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                      className="flex items-center gap-1 text-xs text-teal-600 font-semibold hover:underline"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      Key Results ({krs.length})
                    </button>
                    {user?.role === 'Employee' && (
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={goal.progress}
                        onChange={e => setGoals(goals.map(g => g.id === goal.id ? { ...g, progress: Number(e.target.value) } : g))}
                        className="w-32 accent-teal-600"
                      />
                    )}
                  </div>

                  {/* Key Results list expanded */}
                  {isExpanded && krs.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-2">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide mb-1">Key Results Detail</p>
                      {krs.map(kr => (
                        <div key={kr.id} className="bg-white rounded-lg p-2.5 border border-gray-100 flex items-center justify-between text-xs gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{kr.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Target: {kr.target} (Current: {kr.current})</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${kr.progress}%` }} />
                            </div>
                            <span className="font-bold text-gray-600 w-8 text-right">{kr.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Summary Ratings */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="text-center md:border-r md:border-gray-100 md:pr-10">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Overall Review Rating</p>
              <p className="text-5xl font-black text-teal-700 mt-2">4.8 / 5</p>
              <div className="flex items-center gap-1 justify-center mt-2 text-yellow-400">
                <Star size={16} className="fill-yellow-400" />
                <Star size={16} className="fill-yellow-400" />
                <Star size={16} className="fill-yellow-400" />
                <Star size={16} className="fill-yellow-400" />
                <Star size={16} className="fill-yellow-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">FY 24-25 Q2 Review</p>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Competency Scores</h3>
              {[
                { label: 'Technical Quality', score: 4.9 },
                { label: 'Communication & Collaboration', score: 4.8 },
                { label: 'Ownership & Delivery', score: 4.7 },
              ].map(comp => (
                <div key={comp.label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                    <span>{comp.label}</span>
                    <span className="font-bold text-gray-700">{comp.score} / 5</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-teal-600" style={{ width: `${(comp.score / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Blocks */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-800 text-md border-b border-gray-50 pb-2">Feedback Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-teal-50/30 border border-teal-100/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-teal-800 font-semibold text-sm">
                  <Award size={16} /> Core Strengths
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Alex shows exceptional skills in delivering clean, mobile-first frontend code. His dedication to completing the assessment with detailed UI aesthetics is commendable.
                </p>
              </div>
              <div className="p-4 bg-orange-50/30 border border-orange-100/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-orange-800 font-semibold text-sm">
                  <TrendingUp size={16} /> Growth Areas
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  While technical delivery is fast, focusing on early documentation of APIs and architecture layout checks will help alignment on team deliverables.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Manager comments */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-3">Manager Comments</h3>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                MS
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex-1">
                <p className="text-xs font-semibold text-gray-900">Michael Scott (Engineering Manager)</p>
                <p className="text-xs text-gray-500 mt-0.5">Reviewed on June 22, 2025</p>
                <p className="text-xs text-gray-700 leading-relaxed mt-2">
                  "Alex has done a phenomenal job in stepping up and handling frontend layouts. He quickly resolved the missing onboarding elements and made sure everything fits the product spec documentation. Highly satisfied with his performance this quarter."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Add New Goal</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                <input type="text" required placeholder="e.g. Complete AWS certification"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {GOAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {GOAL_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                  <input type="number" min="1" max="100" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}