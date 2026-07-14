import { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { MOCK_USERS } from '../lib/mockData';
import { RefreshCw } from 'lucide-react';
import type { Role } from '../types';

const ROLE_COLORS: Record<Role, string> = {
  Employee: 'bg-teal-100 text-teal-700 border-teal-200',
  Manager: 'bg-blue-100 text-blue-700 border-blue-200',
  HR: 'bg-purple-100 text-purple-700 border-purple-200',
  Admin: 'bg-orange-100 text-orange-700 border-orange-200',
};

const ROLE_BG: Record<Role, string> = {
  Employee: 'hover:bg-teal-50',
  Manager: 'hover:bg-blue-50',
  HR: 'hover:bg-purple-50',
  Admin: 'hover:bg-orange-50',
};

export default function RoleSwitcher() {
  const { user, setUser } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchRole(role: Role) {
    const mockUser = MOCK_USERS.find(u => u.role === role);
    if (mockUser) {
      setUser(mockUser);
      setOpen(false);
    }
  }

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${ROLE_COLORS[user.role]}`}
        aria-label="Switch role"
      >
        <RefreshCw size={12} />
        {user.role}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          <p className="px-3 pb-2 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Switch Demo Role</p>
          {MOCK_USERS.map(u => (
            <button
              key={u.role}
              onClick={() => switchRole(u.role)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${ROLE_BG[u.role]}
                ${user.role === u.role ? 'bg-gray-50' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                <p className="text-xs text-gray-400 truncate">{u.role} · {u.designation}</p>
              </div>
              {user.role === u.role && (
                <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Active</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
