'use client';

import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { Heart, Plus, X, CheckCircle2, Star, Zap, Users, Target, TrendingUp, Award } from 'lucide-react';
import { RECOGNITIONS, TEAM_MEMBERS } from '../../../lib/mockData';

const CATEGORIES = ['Excellence', 'Team Player', 'Innovation', 'Leadership', 'Customer Focus', 'Above & Beyond'];

const categoryIcon: Record<string, React.ElementType> = {
  'Excellence':      Star,
  'Team Player':     Users,
  'Innovation':      Zap,
  'Leadership':      TrendingUp,
  'Customer Focus':  Target,
  'Above & Beyond':  Award,
};

const categoryColor: Record<string, string> = {
  'Excellence':      'bg-yellow-50 text-yellow-600 border-yellow-200',
  'Team Player':     'bg-green-50 text-green-600 border-green-200',
  'Innovation':      'bg-purple-50 text-purple-600 border-purple-200',
  'Leadership':      'bg-blue-50 text-blue-600 border-blue-200',
  'Customer Focus':  'bg-orange-50 text-orange-600 border-orange-200',
  'Above & Beyond':  'bg-teal-50 text-teal-600 border-teal-200',
};

export default function RecognitionPage() {
  const { user } = useUser();
  const [recognitions, setRecognitions] = useState(RECOGNITIONS);
  const [showModal, setShowModal] = useState(false);
  const [liked, setLiked] = useState<number[]>([]);
  const [successMsg, setSuccessMsg] = useState(false);
  const [form, setForm] = useState({ to: '', category: 'Excellence', message: '' });

  function handleLike(id: number) {
    if (liked.includes(id)) {
      setLiked(liked.filter(l => l !== id));
      setRecognitions(recognitions.map(r => r.id === id ? { ...r, likes: r.likes - 1 } : r));
    } else {
      setLiked([...liked, id]);
      setRecognitions(recognitions.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRecognitions([{
      id: recognitions.length + 1,
      from: user?.name || 'Me',
      to: form.to,
      category: form.category,
      message: form.message,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      isPublic: true,
    }, ...recognitions]);
    setShowModal(false);
    setSuccessMsg(true);
    setForm({ to: '', category: 'Excellence', message: '' });
    setTimeout(() => setSuccessMsg(false), 3000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recognition</h1>
          <p className="text-gray-500 text-sm mt-1">Appreciate your teammates and celebrate wins</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus size={16} /> Give Recognition
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <CheckCircle2 size={16} /> Recognition sent successfully!
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Recognitions', value: recognitions.length },
          { label: 'Given by You',       value: recognitions.filter(r => r.from === user?.name).length },
          { label: 'Received by You',    value: recognitions.filter(r => r.to === user?.name).length },
          { label: 'Total Likes',        value: recognitions.reduce((s, r) => s + r.likes, 0) },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recognition Feed */}
      <div className="space-y-4">
        {recognitions.map(rec => {
          const Icon = categoryIcon[rec.category] || Star;
          const colorClass = categoryColor[rec.category] || 'bg-gray-50 text-gray-600 border-gray-200';
          const isLiked = liked.includes(rec.id);

          return (
            <div key={rec.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                {/* From Avatar */}
                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {rec.from.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{rec.from}</span>
                    <span className="text-xs text-gray-400">recognized</span>
                    <span className="text-sm font-semibold text-teal-600">{rec.to}</span>
                  </div>

                  {/* Category Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium mb-3 ${colorClass}`}>
                    <Icon size={13} />
                    {rec.category}
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-700 leading-relaxed">{rec.message}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400">
                      {new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => handleLike(rec.id)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium
                        ${isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500'}`}
                    >
                      <Heart size={14} className={isLiked ? 'fill-red-500' : ''} />
                      {rec.likes}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Give Recognition Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Give Recognition</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recognize</label>
                <select required value={form.to} onChange={e => setForm({ ...form, to: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select teammate</option>
                  {TEAM_MEMBERS.filter(m => m.name !== user?.name).map(m => (
                    <option key={m.id} value={m.name}>{m.name} — {m.designation}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => {
                    const Icon = categoryIcon[cat];
                    const colorClass = categoryColor[cat];
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all
                          ${form.category === cat ? colorClass + ' ring-2 ring-offset-1 ring-teal-400' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        <Icon size={14} /> {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea required rows={3} placeholder="Write a heartfelt message..."
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}