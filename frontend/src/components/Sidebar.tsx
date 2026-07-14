import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { ComponentType } from 'react';
import {
  LayoutDashboard,
  Clock3,
  CalendarDays,
  Wallet,
  FileText,
  Receipt,
  Target,
  Award,
  GraduationCap,
  Briefcase,
  ThumbsUp,
  Megaphone,
  Users,
  BarChart3,
  Sparkles,
  X,
  Rocket,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import type { NavItem, Role } from '../types';

const ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  dashboard: LayoutDashboard,
  onboarding: Rocket,
  attendance: Clock3,
  leave: CalendarDays,
  payroll: Wallet,
  documents: FileText,
  expenses: Receipt,
  performance: Target,
  contributions: Award,
  training: GraduationCap,
  recruitment: Briefcase,
  recognition: ThumbsUp,
  announcements: Megaphone,
  team: Users,
  analytics: BarChart3,
  copilot: Sparkles,
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard', roles: ['Employee', 'Manager', 'HR', 'Admin'] },
  { label: 'Onboarding', href: '/onboarding', icon: 'onboarding', roles: ['Employee', 'HR', 'Admin'] },
  { label: 'Attendance', href: '/attendance', icon: 'attendance', roles: ['Employee', 'Manager', 'HR', 'Admin'] },
  { label: 'Leave', href: '/leave', icon: 'leave', roles: ['Employee', 'Manager', 'HR', 'Admin'] },
  { label: 'Payroll', href: '/payroll', icon: 'payroll', roles: ['Employee', 'Manager', 'HR', 'Admin'] },
  { label: 'Documents', href: '/documents', icon: 'documents', roles: ['Employee', 'Manager', 'HR', 'Admin'] },
  { label: 'Expenses', href: '/expenses', icon: 'expenses', roles: ['Employee', 'Manager', 'HR', 'Admin'] },
  { label: 'Performance', href: '/performance', icon: 'performance', roles: ['Employee', 'Manager', 'HR', 'Admin'] },
  { label: 'Contributions', href: '/contributions', icon: 'contributions', roles: ['Employee', 'Manager', 'HR', 'Admin'] },
  { label: 'Training', href: '/training', icon: 'training', roles: ['Employee', 'Manager', 'HR', 'Admin'] },
  { label: 'Recruitment', href: '/recruitment', icon: 'recruitment', roles: ['HR', 'Admin'] },
  { label: 'Recognition', href: '/recognition', icon: 'recognition', roles: ['Employee', 'Manager', 'HR', 'Admin'] },
  { label: 'Announcements', href: '/announcements', icon: 'announcements', roles: ['Employee', 'Manager', 'HR', 'Admin'] },
  { label: 'Team', href: '/team', icon: 'team', roles: ['Manager', 'HR', 'Admin'] },
  { label: 'Analytics', href: '/analytics', icon: 'analytics', roles: ['HR', 'Admin'] },
  { label: 'HR Copilot', href: '/copilot', icon: 'copilot', roles: ['Employee', 'Manager', 'HR', 'Admin'] },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser() as { user: any; logout?: () => void };

  const items = NAV_ITEMS.filter((item) => !user?.role || item.roles.includes(user.role as Role));

  function handleLogout() {
    if (logout) {
      logout();
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('hrms_user');
    }
    navigate('/login', { replace: true });
  }

  function initials(name?: string) {
    if (!name) return '—';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 dark:bg-teal-500 text-sm font-bold text-white">
              W
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-slate-100">WorkFlow</span>
          </Link>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 lg:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* User card */}
        <div className="mx-4 mb-3 flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 px-3 py-3 border border-transparent dark:border-slate-800/50">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
            {initials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-slate-200">{user?.name ?? 'Guest'}</p>
            <p className="truncate text-xs text-gray-500 dark:text-slate-400">{user?.designation ?? ''}</p>
          </div>
          {user?.role && (
            <span className="shrink-0 rounded-full bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 text-[11px] font-medium text-teal-700 dark:text-teal-400 border border-teal-100/10">
              {user.role}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {items.map((item) => {
            const Icon = ICONS[item.icon] ?? LayoutDashboard;
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active 
                    ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400' 
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={active ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-slate-500'} />
                {item.label}
              </Link>
            );
          })}
        </nav>


      </aside>
    </>
  );
}
