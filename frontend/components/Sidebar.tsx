'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
  X,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import type { NavItem, Role } from '../app/types';

const ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  dashboard: LayoutDashboard,
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
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser() as { user: any; logout?: () => void };

  const items = NAV_ITEMS.filter((item) => !user?.role || item.roles.includes(user.role as Role));

  function handleLogout() {
    if (logout) {
      logout();
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('hrms_user');
    }
    router.replace('/login');
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
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-100 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">
              W
            </div>
            <span className="text-lg font-semibold text-gray-900">WorkFlow</span>
          </div>
          <button onClick={onClose} className="text-gray-400 lg:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* User card */}
        <div className="mx-4 mb-3 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
            {initials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{user?.name ?? 'Guest'}</p>
            <p className="truncate text-xs text-gray-500">{user?.designation ?? ''}</p>
          </div>
          {user?.role && (
            <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700">
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
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className={active ? 'text-teal-600' : 'text-gray-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}


// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   LayoutDashboard, Clock, Calendar, DollarSign, FileText,
//   Receipt, Target, Award, BookOpen, Users, Gift,
//   Megaphone, BarChart3, Bot, X, LogOut, ChevronRight,
//   Briefcase,
// } from 'lucide-react';
// import { useUser } from '../context/UserContext';
// import { Role } from '../app/types';

// interface NavItem {
//   label: string;
//   href: string;
//   icon: React.ElementType;
//   roles: Role[];
// }

// const NAV_ITEMS: NavItem[] = [
//   { label: 'Dashboard',     href: '/dashboard',      icon: LayoutDashboard, roles: ['Employee','Manager','HR','Admin'] },
//   { label: 'Attendance',    href: '/attendance',     icon: Clock,           roles: ['Employee','Manager','HR','Admin'] },
//   { label: 'Leave',         href: '/leave',          icon: Calendar,        roles: ['Employee','Manager','HR','Admin'] },
//   { label: 'Payroll',       href: '/payroll',        icon: DollarSign,      roles: ['Employee','Manager','HR','Admin'] },
//   { label: 'Documents',     href: '/documents',      icon: FileText,        roles: ['Employee','Manager','HR','Admin'] },
//   { label: 'Expenses',      href: '/expenses',       icon: Receipt,         roles: ['Employee','Manager','HR','Admin'] },
//   { label: 'Performance',   href: '/performance',    icon: Target,          roles: ['Employee','Manager','HR','Admin'] },
//   { label: 'Contributions', href: '/contributions',  icon: Award,           roles: ['Employee','Manager','HR','Admin'] },
//   { label: 'Training',      href: '/training',       icon: BookOpen,        roles: ['Employee','Manager','HR','Admin'] },
//   { label: 'Recruitment',   href: '/recruitment',    icon: Briefcase,       roles: ['HR','Admin'] },
//   { label: 'Recognition',   href: '/recognition',    icon: Gift,            roles: ['Employee','Manager','HR','Admin'] },
//   { label: 'Announcements', href: '/announcements',  icon: Megaphone,       roles: ['Employee','Manager','HR','Admin'] },
//   { label: 'Team',          href: '/team',           icon: Users,           roles: ['Manager','HR','Admin'] },
//   { label: 'Analytics',     href: '/analytics',      icon: BarChart3,       roles: ['Employee','Manager','HR','Admin'] },
//   { label: 'HR Copilot',    href: '/copilot',        icon: Bot,             roles: ['Employee','Manager','HR','Admin'] },
// ];

// interface SidebarProps {
//   open: boolean;
//   onClose: () => void;
// }

// export default function Sidebar({ open, onClose }: SidebarProps) {
//   const { user, logout } = useUser();
//   const pathname = usePathname();

//   const visibleItems = NAV_ITEMS.filter(
//     item => user && item.roles.includes(user.role)
//   );

//   const roleColors: Record<Role, string> = {
//     Employee: 'bg-teal-100 text-teal-700',
//     Manager:  'bg-blue-100 text-blue-700',
//     HR:       'bg-purple-100 text-purple-700',
//     Admin:    'bg-orange-100 text-orange-700',
//   };

//   return (
//     <>
//       {/* Overlay for mobile */}
//       {open && (
//         <div
//           className="fixed inset-0 bg-black/40 z-20 lg:hidden"
//           onClick={onClose}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`
//           fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30
//           flex flex-col transition-transform duration-300
//           ${open ? 'translate-x-0' : '-translate-x-full'}
//           lg:translate-x-0 lg:static lg:z-auto
//         `}
//       >
//         {/* Logo */}
//         <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
//           <div className="flex items-center gap-2.5">
//             <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-sm">W</span>
//             </div>
//             <span className="font-bold text-gray-900 text-lg">WorkFlow</span>
//           </div>
//           <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
//             <X size={20} />
//           </button>
//         </div>

//         {/* User Info */}
//         {user && (
//           <div className="px-4 py-3 border-b border-gray-100">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
//                 {user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
//               </div>
//               <div className="min-w-0">
//                 <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
//                 <p className="text-xs text-gray-500 truncate">{user.designation}</p>
//               </div>
//             </div>
//             <span className={`mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[user.role]}`}>
//               {user.role}
//             </span>
//           </div>
//         )}

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
//           {visibleItems.map((item) => {
//             const Icon = item.icon;
//             const active = pathname === item.href || pathname.startsWith(item.href + '/');
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 onClick={onClose}
//                 className={`
//                   flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
//                   ${active
//                     ? 'bg-teal-50 text-teal-700 font-medium'
//                     : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
//                 `}
//               >
//                 <Icon size={18} className={active ? 'text-teal-600' : 'text-gray-400'} />
//                 <span className="flex-1">{item.label}</span>
//                 {active && <ChevronRight size={14} className="text-teal-400" />}
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Logout */}
//         <div className="px-3 py-3 border-t border-gray-100">
//           <button
//             onClick={logout}
//             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
//           >
//             <LogOut size={18} />
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }