

import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, X, Trash2, LogOut, FileText, User, Calendar, ShieldCheck, Mail, Briefcase, Zap, Building2, Sun, Moon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useUser } from '../context/UserContext';

const SEARCH_ITEMS = [
  // Pages
  { label: 'Dashboard', category: 'Pages', href: '/dashboard', description: 'Overview of HR activities & stats' },
  { label: 'Onboarding', category: 'Pages', href: '/onboarding', description: 'Employee onboarding checklists' },
  { label: 'Attendance', category: 'Pages', href: '/attendance', description: 'Log in/out and view records' },
  { label: 'Leave', category: 'Pages', href: '/leave', description: 'Apply for leaves & balances' },
  { label: 'Payroll', category: 'Pages', href: '/payroll', description: 'View and download payslips' },
  { label: 'Documents', category: 'Pages', href: '/documents', description: 'Verify & manage company documents' },
  { label: 'Expenses', category: 'Pages', href: '/expenses', description: 'Submit claims & track status' },
  { label: 'Performance', category: 'Pages', href: '/performance', description: 'Review goals and performance review summaries' },
  { label: 'Contributions', category: 'Pages', href: '/contributions', description: 'Leaderboard & community rewards' },
  { label: 'Training', category: 'Pages', href: '/training', description: 'Mandatory and elective courses' },
  { label: 'Announcements', category: 'Pages', href: '/announcements', description: 'Important alerts & company announcements' },
  { label: 'HR Copilot', category: 'Pages', href: '/copilot', description: 'AI assistant for payroll & compliance policy queries' },
  
  // Quick Actions
  { label: 'Apply for Leave', category: 'Actions', href: '/leave', description: 'Open leave application form' },
  { label: 'Upload Document', category: 'Actions', href: '/documents', description: 'Upload ID or KYC files' },
  { label: 'Submit Expense Claim', category: 'Actions', href: '/expenses', description: 'Submit travel or food receipts' },
  { label: 'Clock In / Clock Out', category: 'Actions', href: '/attendance', description: 'Mark daily attendance with selfie/geo' },
  
  // Key Resources
  { label: 'Sarah Johnson', category: 'People', href: '/team', description: 'Software Engineer - Engineering' },
  { label: 'Michael Scott', category: 'People', href: '/team', description: 'Engineering Manager - Engineering' },
  { label: 'Priya Sharma', category: 'People', href: '/team', description: 'HR Specialist - HR' },
  { label: 'Offer Letter', category: 'Documents', href: '/documents', description: 'Verified joining document' },
  { label: 'Salary Slip', category: 'Documents', href: '/documents', description: 'Payroll slip for download' },
  { label: 'React Advanced Patterns', category: 'Training', href: '/training', description: 'Technical development course' }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useUser() as { user: any; logout?: () => void };
  const navigate = useNavigate();

  // Dropdown States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Theme Toggling State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Update html element class on theme change
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Your Casual Leave request was approved', detail: 'Approved by Michael Scott for June 25-26.', time: '10m ago', read: false, type: 'leave' },
    { id: 2, title: 'New policy document uploaded by HR', detail: 'New Health Insurance Policy is effective from July 1.', time: '2h ago', read: false, type: 'policy' },
    { id: 3, title: 'Verification Successful', detail: 'Aadhaar Card copy has been verified by Admin.', time: '1d ago', read: true, type: 'document' },
    { id: 4, title: 'Town Hall meeting scheduled', detail: 'Q2 Town Hall on June 30 at 3:00 PM.', time: '2d ago', read: true, type: 'event' }
  ]);

  // Click Outside References
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function toggleRead(id: number) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  }

  function removeNotification(id: number) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  function handleLogout() {
    if (logout) {
      logout();
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('hrms_user');
    }
    navigate('/login', { replace: true });
  }

  // Filter Search
  const filteredSearch = searchQuery.trim() === '' 
    ? [] 
    : SEARCH_ITEMS.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const popularPages = SEARCH_ITEMS.filter(item => 
    ['Dashboard', 'Onboarding', 'Documents', 'HR Copilot'].includes(item.label) && item.category === 'Pages'
  );

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
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-4 flex-shrink-0 relative z-30 transition-colors duration-200">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200" aria-label="Open menu">
            <Menu size={22} />
          </button>

          {/* Search Section */}
          <div ref={searchRef} className="flex-1 max-w-md hidden sm:block relative">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-850 rounded-lg px-3 py-2 border border-gray-200 dark:border-slate-700 focus-within:border-teal-500 focus-within:bg-white dark:focus-within:bg-slate-900/60 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
              <Search size={16} className="text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search pages, actions, people..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                className="bg-transparent text-sm outline-none flex-1 text-gray-600 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden max-h-[380px] overflow-y-auto z-50">
                {searchQuery.trim() === '' ? (
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">Popular Pages</p>
                    <div className="space-y-1">
                      {popularPages.map(page => (
                        <Link
                          key={page.href}
                          to={page.href}
                          onClick={() => {
                            setSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-teal-50/50 dark:hover:bg-teal-950/20 hover:text-teal-700 dark:hover:text-teal-400 text-sm text-gray-600 dark:text-slate-300 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-semibold text-xs group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40">
                              {page.label[0]}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 leading-tight">{page.label}</p>
                              <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{page.description}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : filteredSearch.length > 0 ? (
                  <div className="py-2">
                    {/* Group by category */}
                    {['Pages', 'Actions', 'People', 'Documents', 'Training'].map(cat => {
                      const catItems = filteredSearch.filter(i => i.category === cat);
                      if (catItems.length === 0) return null;
                      return (
                        <div key={cat} className="px-3 py-1.5 border-b border-gray-50 dark:border-slate-800 last:border-0">
                          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-2 text-left">{cat}</p>
                          <div className="space-y-0.5">
                            {catItems.map(item => (
                              <Link
                                key={item.label}
                                to={item.href}
                                onClick={() => {
                                  setSearchFocused(false);
                                  setSearchQuery('');
                                }}
                                className="flex flex-col p-2 rounded-lg hover:bg-teal-50/50 dark:hover:bg-teal-950/20 text-sm text-gray-700 dark:text-slate-300 transition-colors group text-left"
                              >
                                <span className="font-medium text-gray-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400">{item.label}</span>
                                <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{item.description}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 dark:text-slate-500">
                    <Search size={28} className="mx-auto mb-2 opacity-30 text-gray-400 dark:text-slate-500" />
                    <p className="text-sm">No results found for &ldquo;<span className="font-semibold text-gray-600 dark:text-slate-300">{searchQuery}</span>&rdquo;</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right section icons with proportional sizing, alignment, padding and gaps */}
          <div className="ml-auto flex items-center gap-4 relative">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors flex items-center justify-center focus:outline-none"
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Notifications Dropdown */}
            <div ref={notificationsRef} className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }} 
                className={`relative h-9 w-9 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center focus:outline-none ${showNotifications ? 'bg-gray-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-slate-400'}`} 
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold px-0.5 shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-semibold">{unreadCount} new</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[280px] overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
                    {notifications.length > 0 ? (
                      notifications.map(notif => {
                        let IconComponent = Bell;
                        let iconColor = 'text-gray-500 bg-gray-50 dark:text-slate-400 dark:bg-slate-800';
                        if (notif.type === 'leave') {
                          IconComponent = Calendar;
                          iconColor = 'text-orange-500 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/20';
                        } else if (notif.type === 'policy') {
                          IconComponent = FileText;
                          iconColor = 'text-blue-500 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20';
                        } else if (notif.type === 'document') {
                          IconComponent = ShieldCheck;
                          iconColor = 'text-green-500 bg-green-50 dark:text-green-400 dark:bg-green-950/20';
                        } else if (notif.type === 'event') {
                          IconComponent = Zap;
                          iconColor = 'text-purple-500 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/20';
                        }

                        return (
                          <div 
                            key={notif.id} 
                            onClick={() => toggleRead(notif.id)}
                            className={`p-3 flex items-start gap-3 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors relative group text-left ${!notif.read ? 'bg-teal-50/10 dark:bg-teal-950/5' : ''}`}
                          >
                            {!notif.read && (
                              <span className="absolute top-4 left-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full" />
                            )}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                              <IconComponent size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold text-gray-900 dark:text-slate-100 leading-snug ${!notif.read ? 'font-bold text-teal-950 dark:text-teal-400' : 'text-gray-700 dark:text-slate-300'}`}>{notif.title}</p>
                              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.detail}</p>
                              <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 block">{notif.time}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notif.id);
                              }}
                              className="text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-gray-400 dark:text-slate-500">
                        <Bell size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs">All caught up! No notifications.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Details Dropdown */}
            <div ref={profileRef} className="relative">
              <button 
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }} 
                className="w-9 h-9 rounded-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition-colors flex items-center justify-center text-white font-semibold text-xs border border-white dark:border-slate-800 shadow-sm cursor-pointer flex-shrink-0 focus:outline-none"
                aria-label="User profile"
              >
                {initials(user?.name)}
              </button>

              {showProfile && user && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 z-50 p-4">
                  {/* Quick User summary */}
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-slate-800 text-left">
                    <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0">
                      {initials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-slate-100 truncate text-sm leading-tight">{user.name}</p>
                      <p className="text-[11px] font-semibold text-teal-600 mt-0.5 leading-none bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.5 rounded-full inline-block">
                        {user.role}
                      </p>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="py-3 space-y-2.5 text-xs text-gray-600 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 text-left">
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-gray-400 dark:text-slate-500" />
                      <span className="font-medium text-gray-400 dark:text-slate-500 w-16">ID:</span>
                      <span className="text-gray-800 dark:text-slate-200 font-medium font-mono">{user.employeeId || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={13} className="text-gray-400 dark:text-slate-500" />
                      <span className="font-medium text-gray-400 dark:text-slate-500 w-16">Title:</span>
                      <span className="text-gray-800 dark:text-slate-200 font-medium truncate">{user.designation || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 size={13} className="text-gray-400 dark:text-slate-500" />
                      <span className="font-medium text-gray-400 dark:text-slate-500 w-16">Dept:</span>
                      <span className="text-gray-800 dark:text-slate-200 font-medium truncate">{user.department || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-gray-400 dark:text-slate-500" />
                      <span className="font-medium text-gray-400 dark:text-slate-500 w-16">Email:</span>
                      <span className="text-gray-800 dark:text-slate-200 font-medium truncate">{user.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-gray-400 dark:text-slate-500" />
                      <span className="font-medium text-gray-400 dark:text-slate-500 w-16">Joined:</span>
                      <span className="text-gray-800 dark:text-slate-200 font-medium">{user.joinDate || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs font-semibold rounded-lg"
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0 bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}