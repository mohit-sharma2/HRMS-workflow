'use client';

import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { BookOpen, CheckCircle2, Clock, Lock, Play, Award, Filter } from 'lucide-react';
import { TRAININGS } from '../../../lib/mockData';

const CATEGORIES = ['All', 'Technical', 'Compliance', 'Soft Skills', 'Orientation'];

export default function TrainingPage() {
  const { user } = useUser();
  const [trainings, setTrainings] = useState(TRAININGS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTraining, setActiveTraining] = useState<typeof TRAININGS[0] | null>(null);

  const completed = trainings.filter(t => t.status === 'Completed').length;
  const inProgress = trainings.filter(t => t.status === 'In Progress').length;
  const notStarted = trainings.filter(t => t.status === 'Not Started').length;
  const mandatory = trainings.filter(t => t.mandatory).length;

  const filtered = trainings.filter(t =>
    activeCategory === 'All' || t.category === activeCategory
  );

  function handleStart(id: number) {
    setTrainings(trainings.map(t =>
      t.id === id ? { ...t, status: 'In Progress', progress: t.progress === 0 ? 10 : t.progress } : t
    ));
    setActiveTraining(null);
  }

  const statusStyle: Record<string, string> = {
    'Completed':   'bg-green-100 text-green-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Not Started': 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Training & Learning</h1>
        <p className="text-gray-500 text-sm mt-1">Complete your assigned courses and earn certificates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Completed',   value: completed,   color: 'bg-green-50 text-green-600',  icon: CheckCircle2 },
          { label: 'In Progress', value: inProgress,  color: 'bg-blue-50 text-blue-600',    icon: Clock },
          { label: 'Not Started', value: notStarted,  color: 'bg-gray-50 text-gray-500',    icon: Lock },
          { label: 'Mandatory',   value: mandatory,   color: 'bg-orange-50 text-orange-600', icon: BookOpen },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${activeCategory === c ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Training Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {filtered.map(training => (
          <div key={training.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-gray-900">{training.title}</h3>
                  {training.mandatory && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Mandatory</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{training.category}</span>
                  <span>·</span>
                  <span>{training.duration}</span>
                  <span>·</span>
                  <span>Due: {new Date(training.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusStyle[training.status]}`}>
                {training.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-semibold text-gray-700">{training.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all
                    ${training.progress === 100 ? 'bg-green-500' : 'bg-teal-500'}`}
                  style={{ width: `${training.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {training.certificate && training.status === 'Completed' ? (
                <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                  <Award size={14} /> Certificate Earned
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  {training.certificate ? 'Certificate on completion' : 'No certificate'}
                </span>
              )}

              <button
                onClick={() => setActiveTraining(training)}
                disabled={training.status === 'Completed'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${training.status === 'Completed'
                    ? 'bg-green-50 text-green-600 cursor-default'
                    : 'bg-teal-600 text-white hover:bg-teal-700'}`}
              >
                {training.status === 'Completed'
                  ? <><CheckCircle2 size={13} /> Completed</>
                  : <><Play size={13} /> {training.status === 'In Progress' ? 'Continue' : 'Start'}</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Training Modal */}
      {activeTraining && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setActiveTraining(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-teal-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{activeTraining.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{activeTraining.category} · {activeTraining.duration}</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-gray-800">{activeTraining.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium text-gray-800">{activeTraining.progress}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Due Date</span>
                <span className="font-medium text-gray-800">
                  {new Date(activeTraining.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Certificate</span>
                <span className="font-medium text-gray-800">{activeTraining.certificate ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setActiveTraining(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleStart(activeTraining.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
                <Play size={14} /> {activeTraining.status === 'In Progress' ? 'Continue' : 'Start Training'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}