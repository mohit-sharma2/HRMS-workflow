'use client';

import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { JOB_POSTINGS, CANDIDATES } from '../../../lib/mockData';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const BriefcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);

const CurrencyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type Job = typeof JOB_POSTINGS[0];
type Candidate = typeof CANDIDATES[0];

type JobModalMode = 'view' | 'add';

// ─── Candidate status config ──────────────────────────────────────────────────

const CANDIDATE_STATUS_STYLES: Record<string, string> = {
  'New':                 'bg-gray-100 text-gray-600',
  'Shortlisted':         'bg-blue-100 text-blue-700',
  'Interview Scheduled': 'bg-purple-100 text-purple-700',
  'Offered':             'bg-teal-100 text-teal-700',
  'Rejected':            'bg-red-100 text-red-600',
};

const JOB_STATUS_STYLES: Record<string, string> = {
  'Active':   'bg-green-100 text-green-700',
  'Paused':   'bg-yellow-100 text-yellow-700',
  'Closed':   'bg-gray-100 text-gray-500',
};

const PIPELINE_STAGES = ['New', 'Shortlisted', 'Interview Scheduled', 'Offered', 'Rejected'];

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  const pct = job.applicants > 0 ? Math.round((job.shortlisted / job.applicants) * 100) : 0;
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate">{job.title}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span className="flex items-center gap-1 text-xs text-gray-400"><BuildingIcon />{job.department}</span>
            <span className="flex items-center gap-1 text-xs text-gray-400"><MapPinIcon />{job.location}</span>
            <span className="flex items-center gap-1 text-xs text-gray-400"><CurrencyIcon />{job.salary}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${JOB_STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {job.status}
          </span>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{job.type}</span>
        </div>
      </div>

      {/* Pipeline mini-bar */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 rounded-lg mb-3">
        {[
          { label: 'Applied',     value: job.applicants },
          { label: 'Shortlisted', value: job.shortlisted },
          { label: 'Interviewing',value: job.interviewing },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center py-2">
            <span className="text-sm font-bold text-gray-800">{s.value}</span>
            <span className="text-xs text-gray-400">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 mr-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Shortlist rate</span>
            <span className="text-xs font-medium text-gray-600">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-0.5">
          {job.experience} <ChevronRightIcon />
        </span>
      </div>
    </div>
  );
}

function CandidateRow({
  candidate,
  onStatusChange,
  onClick,
}: {
  candidate: Candidate;
  onStatusChange: (id: number, status: string) => void;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100"
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
        {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-700 transition-colors">{candidate.name}</p>
        <p className="text-xs text-gray-400 truncate">{candidate.role}</p>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-0.5 text-yellow-400 flex-shrink-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} filled={i < candidate.rating} />
        ))}
      </div>

      {/* Status badge */}
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${CANDIDATE_STATUS_STYLES[candidate.status] ?? 'bg-gray-100 text-gray-600'}`}>
        {candidate.status}
      </span>

      {/* Notice period */}
      <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">{candidate.noticePeriod}</span>
    </div>
  );
}

// ─── Job Detail Modal ─────────────────────────────────────────────────────────

function JobDetailModal({ job, candidates, onClose, onUpdateCandidateStatus }: {
  job: Job;
  candidates: Candidate[];
  onClose: () => void;
  onUpdateCandidateStatus: (id: number, status: string) => void;
}) {
  const jobCandidates = candidates.filter(c => c.role === job.title);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 pt-16 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl mb-8" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${JOB_STATUS_STYLES[job.status]}`}>{job.status}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1 text-xs text-gray-400"><BuildingIcon />{job.department}</span>
              <span className="flex items-center gap-1 text-xs text-gray-400"><MapPinIcon />{job.location}</span>
              <span className="flex items-center gap-1 text-xs text-gray-400"><CurrencyIcon />{job.salary}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Pipeline stats */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          {[
            { label: 'Total Applied',  value: job.applicants,   color: 'text-gray-700' },
            { label: 'Shortlisted',    value: job.shortlisted,  color: 'text-blue-600' },
            { label: 'Interviewing',   value: job.interviewing, color: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center py-4 gap-0.5">
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              <span className="text-xs text-gray-400">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Job details */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Job Details</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Type',       value: job.type },
              { label: 'Experience', value: job.experience },
              { label: 'Salary',     value: job.salary },
              { label: 'Location',   value: job.location },
            ].map(d => (
              <div key={d.label} className="bg-gray-50 rounded-lg px-3 py-2.5">
                <p className="text-xs text-gray-400 mb-0.5">{d.label}</p>
                <p className="text-sm font-medium text-gray-800">{d.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Candidates */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Candidates
            <span className="ml-2 text-xs font-normal text-gray-400">({jobCandidates.length} matched)</span>
          </h3>
          {jobCandidates.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No candidates linked to this role yet.</div>
          ) : (
            <div className="space-y-1">
              {jobCandidates.map(c => (
                <div key={c.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.experience} · {c.expectedSalary} · {c.noticePeriod}</p>
                  </div>
                  <select
                    value={c.status}
                    onChange={e => { e.stopPropagation(); onUpdateCandidateStatus(c.id, e.target.value); }}
                    onClick={e => e.stopPropagation()}
                    className={`text-xs px-2 py-1 rounded-lg border-0 font-medium cursor-pointer outline-none ${CANDIDATE_STATUS_STYLES[c.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">
            Edit Posting
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Candidate Detail Modal ───────────────────────────────────────────────────

function CandidateDetailModal({ candidate, onClose, onStatusChange }: {
  candidate: Candidate;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-base">
              {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{candidate.name}</h2>
              <p className="text-xs text-gray-400">{candidate.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <XIcon />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Rating */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Rating</span>
            <div className="flex items-center gap-0.5 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} filled={i < candidate.rating} />)}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Experience',       value: candidate.experience },
              { label: 'Expected Salary',  value: candidate.expectedSalary },
              { label: 'Notice Period',    value: candidate.noticePeriod },
              { label: 'Current Status',   value: candidate.status },
            ].map(d => (
              <div key={d.label} className="bg-gray-50 rounded-lg px-3 py-2.5">
                <p className="text-xs text-gray-400 mb-0.5">{d.label}</p>
                <p className="text-sm font-medium text-gray-800">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map(s => (
                <span key={s} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">{s}</span>
              ))}
            </div>
          </div>

          {/* Move stage */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Move to stage</p>
            <div className="flex flex-wrap gap-1.5">
              {PIPELINE_STAGES.filter(s => s !== candidate.status).map(s => (
                <button
                  key={s}
                  onClick={() => { onStatusChange(candidate.id, s); onClose(); }}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors hover:opacity-80 ${CANDIDATE_STATUS_STYLES[s] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Close
          </button>
          <button className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">
            Schedule Interview
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabType = 'jobs' | 'candidates';

export default function RecruitmentPage() {
  const { user } = useUser();
  const [tab, setTab] = useState<TabType>('jobs');
  const [jobs, setJobs] = useState(JOB_POSTINGS);
  const [candidates, setCandidates] = useState(CANDIDATES);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const totalApplicants = jobs.reduce((acc, j) => acc + j.applicants, 0);
  const totalShortlisted = jobs.reduce((acc, j) => acc + j.shortlisted, 0);
  const totalInterviewing = jobs.reduce((acc, j) => acc + j.interviewing, 0);
  const activeJobs = jobs.filter(j => j.status === 'Active').length;

  const handleCandidateStatusChange = (id: number, status: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    if (selectedCandidate?.id === id) setSelectedCandidate(prev => prev ? { ...prev, status } : null);
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-gray-500 text-sm mt-1">Manage job postings and track candidates through the hiring pipeline</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm self-start sm:self-auto">
          <PlusIcon />
          New Job Posting
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Openings"   value={activeJobs}          icon={<BriefcaseIcon />} color="bg-teal-50 text-teal-600" />
        <StatCard label="Total Applicants"  value={totalApplicants}     icon={<UsersIcon />}     color="bg-blue-50 text-blue-600" />
        <StatCard label="Shortlisted"       value={totalShortlisted}    icon={<CheckIcon />}     color="bg-green-50 text-green-600" />
        <StatCard label="Interviewing"      value={totalInterviewing}   icon={<ClockIcon />}     color="bg-orange-50 text-orange-600" />
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 self-start">
          {(['jobs', 'candidates'] as TabType[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearchQuery(''); setStatusFilter('All'); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors
                ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={tab === 'jobs' ? 'Search jobs...' : 'Search candidates...'}
              className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white"
            />
          </div>

          {tab === 'candidates' && (
            <div className="flex gap-1.5 flex-wrap">
              {['All', ...PIPELINE_STAGES].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${statusFilter === s ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Jobs Tab */}
      {tab === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredJobs.length === 0 ? (
            <div className="col-span-2 text-center py-16 text-gray-400 text-sm">No job postings match your search.</div>
          ) : filteredJobs.map(job => (
            <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
          ))}
        </div>
      )}

      {/* Candidates Tab */}
      {tab === 'candidates' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Candidate</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:block">Rating</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:block">Notice</span>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No candidates match your filters.</div>
          ) : (
            <div className="divide-y divide-gray-50 px-2 py-1">
              {filteredCandidates.map(c => (
                <CandidateRow
                  key={c.id}
                  candidate={c}
                  onStatusChange={handleCandidateStatusChange}
                  onClick={() => setSelectedCandidate(c)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          candidates={candidates}
          onClose={() => setSelectedJob(null)}
          onUpdateCandidateStatus={handleCandidateStatusChange}
        />
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onStatusChange={handleCandidateStatusChange}
        />
      )}
    </div>
  );
}