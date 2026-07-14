import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { BookOpen, CheckCircle2, Clock, Lock, Play, Award, X, Sparkles, Star } from 'lucide-react';
import { TRAININGS } from '../lib/mockData';

const CATEGORIES = ['All', 'Technical', 'Compliance', 'Soft Skills', 'Orientation'];

const INITIAL_CHAPTERS: Record<number, { id: number; title: string; duration: string; completed: boolean }[]> = {
  1: [
    { id: 11, title: 'Course Overview & Setup', duration: '15m', completed: true },
    { id: 12, title: 'React Server Components vs Client Components', duration: '30m', completed: true },
    { id: 13, title: 'Turbopack build optimization', duration: '45m', completed: true },
    { id: 14, title: 'Creating Custom Hooks', duration: '30m', completed: true },
  ],
  2: [
    { id: 21, title: 'Anti-Harassment policy overview', duration: '10m', completed: true },
    { id: 22, title: 'Reporting mechanisms', duration: '15m', completed: true },
    { id: 23, title: 'Scenario assessment & final quiz', duration: '20m', completed: false },
  ],
  3: [
    { id: 31, title: 'Introduction to effective teamwork', duration: '20m', completed: false },
    { id: 32, title: 'Handling project delivery conflicts', duration: '25m', completed: false },
  ],
  4: [
    { id: 41, title: 'Welcome video from CEO', duration: '10m', completed: true },
    { id: 42, title: 'HR documentation guide', duration: '20m', completed: true },
    { id: 43, title: 'IT access setup checklist', duration: '30m', completed: true },
  ]
};

export default function TrainingPage() {
  const { user } = useUser();
  const [trainings, setTrainings] = useState(TRAININGS);
  const [chapters, setChapters] = useState(INITIAL_CHAPTERS);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Modals state
  const [activeTraining, setActiveTraining] = useState<typeof TRAININGS[0] | null>(null);
  const [certificateModal, setCertificateModal] = useState<typeof TRAININGS[0] | null>(null);

  const completed = trainings.filter(t => t.status === 'Completed').length;
  const inProgress = trainings.filter(t => t.status === 'In Progress').length;
  const notStarted = trainings.filter(t => t.status === 'Not Started').length;
  const mandatory = trainings.filter(t => t.mandatory).length;

  const filtered = trainings.filter(t =>
    activeCategory === 'All' || t.category === activeCategory
  );

  function toggleChapter(courseId: number, chapterId: number) {
    const courseChapters = chapters[courseId] || [];
    const updated = courseChapters.map(ch =>
      ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch
    );
    
    setChapters({ ...chapters, [courseId]: updated });

    // Calculate new progress percentage
    const completedCount = updated.filter(ch => ch.completed).length;
    const totalCount = updated.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // Update training progress & status
    setTrainings(prev => prev.map(t => {
      if (t.id === courseId) {
        const status = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';
        return { ...t, progress, status };
      }
      return t;
    }));

    // Update active training preview modal if open
    if (activeTraining && activeTraining.id === courseId) {
      setActiveTraining(prev => prev ? {
        ...prev,
        progress,
        status: progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started'
      } : null);
    }
  }

  function startOrContinueCourse(course: typeof TRAININGS[0]) {
    setActiveTraining(course);
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
          <div key={training.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
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
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 w-fit ${statusStyle[training.status]}`}>
                  {training.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs font-semibold text-gray-700">{training.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300
                      ${training.progress === 100 ? 'bg-green-500' : 'bg-teal-500'}`}
                    style={{ width: `${training.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              {training.certificate && training.status === 'Completed' ? (
                <button
                  onClick={() => setCertificateModal(training)}
                  className="flex items-center gap-1 text-xs text-yellow-600 font-semibold hover:underline"
                >
                  <Award size={14} /> Claim Certificate
                </button>
              ) : (
                <span className="text-xs text-gray-400">
                  {training.certificate ? 'Certificate on completion' : 'No certificate'}
                </span>
              )}

              <button
                onClick={() => startOrContinueCourse(training)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${training.status === 'Completed'
                    ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                    : 'bg-teal-600 text-white hover:bg-teal-700'}`}
              >
                {training.status === 'Completed' ? (
                  <><CheckCircle2 size={13} /> View Content</>
                ) : (
                  <><Play size={13} /> {training.status === 'In Progress' ? 'Continue' : 'Start'}</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail / Chapter completion Modal */}
      {activeTraining && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setActiveTraining(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{activeTraining.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{activeTraining.category} · {activeTraining.duration}</p>
              </div>
              <button onClick={() => setActiveTraining(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* Progress stats */}
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-3.5 mb-4 flex justify-between items-center text-teal-800 text-xs">
              <div>
                <span className="font-semibold">Course Progress</span>
                <p className="text-lg font-black text-teal-700 mt-0.5">{activeTraining.progress}%</p>
              </div>
              {activeTraining.status === 'Completed' && (
                <div className="flex items-center gap-1 text-green-700 font-bold bg-green-50 px-2 py-1 rounded-lg">
                  <CheckCircle2 size={13} /> Completed!
                </div>
              )}
            </div>

            {/* Chapters list */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto mb-5 pr-1">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Course Syllabus Modules</p>
              {(chapters[activeTraining.id] || []).map(ch => (
                <div
                  key={ch.id}
                  className={`flex items-center gap-3 border rounded-xl p-3 transition-colors ${
                    ch.completed ? 'bg-green-50/20 border-green-100' : 'bg-white border-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={ch.completed}
                    onChange={() => toggleChapter(activeTraining.id, ch.id)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600 flex-shrink-0 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${ch.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{ch.title}</p>
                    <span className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {ch.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTraining(null)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-2.5 text-xs font-semibold transition-colors"
            >
              Close Syllabus
            </button>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {certificateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setCertificateModal(null)}>
          <div className="bg-white border-4 border-yellow-500/30 rounded-3xl p-8 w-full max-w-xl shadow-2xl relative text-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setCertificateModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={36} className="text-yellow-600" />
            </div>
            
            <span className="text-xs text-yellow-600 font-bold uppercase tracking-widest bg-yellow-50 px-3 py-1 rounded-full">
              Certificate of Completion
            </span>
            
            <h3 className="text-2xl font-serif text-gray-900 mt-5 font-bold">WorkFlow Learning Academy</h3>
            <p className="text-xs text-gray-400 mt-1 italic">This is proudly presented to</p>
            
            <p className="text-xl font-bold text-teal-700 font-serif border-b border-gray-100 pb-2 max-w-xs mx-auto mt-4">
              {user?.name || 'Alex Ramirez'}
            </p>
            
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto mt-3">
              for successfully completing all syllabus modules and practical assessment requirements for the course
            </p>
            
            <p className="text-md font-bold text-gray-800 mt-2">
              "{certificateModal.title}"
            </p>
            
            <div className="flex justify-between items-center max-w-md mx-auto mt-8 pt-4 border-t border-gray-50 text-[10px] text-gray-400">
              <div className="text-left">
                <span className="block font-semibold text-gray-600">June 20, 2025</span>
                <span className="block">Date of Completion</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-teal-700 text-xs">
                <Sparkles size={14} className="text-yellow-500" />
                <span>Verified Online</span>
              </div>
              <div className="text-right">
                <span className="block font-semibold text-gray-600">ID: WLA-890240</span>
                <span className="block">Certificate Hash</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}