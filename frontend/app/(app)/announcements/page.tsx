'use client';

import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { Megaphone, Plus, X, CheckCircle2, Eye, ThumbsUp, AlertCircle, Info, Calendar, Tag } from 'lucide-react';
import { ANNOUNCEMENTS } from '../../../lib/mockData';

const PRIORITIES = ['High', 'Medium', 'Low'];
const ANNOUNCEMENT_CATEGORIES = ['HR Update', 'Policy', 'Event', 'Celebration', 'General'];

const priorityStyle: Record<string, string> = {
  High:   'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low:    'bg-green-100 text-green-700 border-green-200',
};

const priorityIcon: Record<string, React.ElementType> = {
  High:   AlertCircle,
  Medium: Info,
  Low:    CheckCircle2,
};

const categoryColor: Record<string, string> = {
  'HR Update':   'bg-blue-50 text-blue-600',
  'Policy':      'bg-purple-50 text-purple-600',
  'Event':       'bg-orange-50 text-orange-600',
  'Celebration': 'bg-teal-50 text-teal-600',
  'General':     'bg-gray-100 text-gray-600',
};

export default function AnnouncementsPage() {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState(ANNOUNCEMENTS);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [liked, setLiked] = useState<number[]>([]);
  const [successMsg, setSuccessMsg] = useState(false);
  const [filterPriority, setFilterPriority] = useState('All');
  const [form, setForm] = useState({ title: '', category: 'General', priority: 'Medium', content: '' });

  const filtered = announcements.filter(a =>
    filterPriority === 'All' || a.priority === filterPriority
  );

  function handleLike(id: number) {
    if (liked.includes(id)) {
      setLiked(liked.filter(l => l !== id));
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, likes: a.likes - 1 } : a));
    } else {
      setLiked([...liked, id]);
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, likes: a.likes + 1 } : a));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAnnouncements([{
      id: announcements.length + 1,
      title: form.title,
      category: form.category,
      priority: form.priority,
      date: new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0,
      content: form.content,
    }, ...announcements]);
    setShowModal(false);
    setSuccessMsg(true);
    setForm({ title: '', category: 'General', priority: 'Medium', content: '' });
    setTimeout(() => setSuccessMsg(false), 3000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 text-sm mt-1">Stay updated with company news and policies</p>
        </div>
        {(user?.role === 'HR' || user?.role === 'Admin') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            <Plus size={16} /> New Announcement
          </button>
        )}
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <CheckCircle2 size={16} /> Announcement posted successfully!
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',       value: announcements.length },
          { label: 'High Priority', value: announcements.filter(a => a.priority === 'High').length },
          { label: 'This Month',  value: announcements.filter(a => a.date.startsWith('2025-06')).length },
          { label: 'Total Views', value: announcements.reduce((s, a) => s + a.views, 0) },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Priority Filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {['All', ...PRIORITIES].map(p => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${filterPriority === p ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map(ann => {
          const PriorityIcon = priorityIcon[ann.priority];
          const isExpanded = expanded === ann.id;
          const isLiked = liked.includes(ann.id);

          return (
            <div key={ann.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Megaphone size={20} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{ann.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${priorityStyle[ann.priority]}`}>
                        <PriorityIcon size={11} /> {ann.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor[ann.category]}`}>
                        {ann.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(ann.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {ann.views} views
                      </span>
                    </div>

                    {/* Content */}
                    <p className={`text-sm text-gray-600 mt-2 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                      {ann.content}
                    </p>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : ann.id)}
                      className="text-xs text-teal-600 hover:underline mt-1"
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => handleLike(ann.id)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium
                      ${isLiked ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-500 hover:bg-teal-50 hover:text-teal-600'}`}
                  >
                    <ThumbsUp size={14} className={isLiked ? 'fill-teal-500' : ''} />
                    {ann.likes} {isLiked ? 'Liked' : 'Like'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Announcement Modal — HR/Admin only */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">New Announcement</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" required placeholder="Announcement title"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {ANNOUNCEMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea required rows={4} placeholder="Write the announcement..."
                  value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}