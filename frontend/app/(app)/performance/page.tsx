'use client';

import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { Target, Plus, X, TrendingUp, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { GOALS } from '../../../lib/mockData';

const GOAL_CATEGORIES = ['Individual', 'Team', 'Departmental'];
const GOAL_TYPES = ['Quarterly', 'Annual'];

export default function PerformancePage() {
  const { user } = useUser();
  const [goals, setGoals] = useState(GOALS);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Individual', type: 'Quarterly', dueDate: '', weight: '25' });

  const avgProgress = Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGoals([{
      id: goals.length + 1,
      title: form.title,
      category: form.category,
      type: form.type,
      progress: 0,
      status: 'In Progress',
      dueDate: form.dueDate,
      weight: Number(form.weight),
    }, ...goals]);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance & Goals</h1>
          <p className="text-gray-500 text-sm mt-1">Track your OKRs and performance reviews</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus size={16} /> Add Goal
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <CheckCircle2 size={16} /> Goal added successfully!
        </div>
      )}

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-teal-100 text-sm">Overall Goal Completion</p>
            <p className="text-5xl font-bold mt-1">{avgProgress}%</p>
            <p className="text-teal-100 text-sm mt-1">{goals.length} active goals</p>
          </div>
          <div className="w-full sm:w-48">
            <div className="w-full bg-teal-500 rounded-full h-3">
              <div className="h-3 rounded-full bg-white" style={{ width: `${avgProgress}%` }} />
            </div>
            <div className="flex justify-between text-xs text-teal-200 mt-1">
              <span>0%</span><span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'On Track',    value: goals.filter(g => g.status === 'On Track').length,    color: 'bg-green-50 text-green-600' },
          { label: 'In Progress', value: goals.filter(g => g.status === 'In Progress').length, color: 'bg-blue-50 text-blue-600' },
          { label: 'At Risk',     value: goals.filter(g => g.status === 'At Risk').length,     color: 'bg-red-50 text-red-600' },
          { label: 'Completed',   value: goals.filter(g => g.status === 'Completed').length,   color: 'bg-teal-50 text-teal-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <Target size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map(goal => {
          const Icon = StatusIcon[goal.status] || Clock;
          return (
            <div key={goal.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
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
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 flex-shrink-0 ${statusStyle[goal.status]}`}>
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
                    className={`h-2.5 rounded-full transition-all ${progressColor(goal.status)}`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {/* Update Progress */}
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={goal.progress}
                  onChange={e => setGoals(goals.map(g => g.id === goal.id ? { ...g, progress: Number(e.target.value) } : g))}
                  className="flex-1 accent-teal-600"
                />
                <span className="text-xs text-gray-400 w-12 text-right">Update</span>
              </div>
            </div>
          );
        })}
      </div>

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