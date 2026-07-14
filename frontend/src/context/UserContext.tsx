import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { HRMSUser } from '../types';
import { MOCK_USERS } from '../lib/mockData';

interface UserContextType {
  user: HRMSUser | null;
  setUser: (user: HRMSUser | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
  isLoading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<HRMSUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hrms_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const fullUser = MOCK_USERS.find(u => u.email === parsed.email) || parsed;
        setUserState(fullUser);
        if (!Cookies.get('auth_token')) {
          Cookies.set('auth_token', 'mock_token_' + (fullUser.employeeId || 'user'), { expires: 7, sameSite: 'lax' });
        }
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const setUser = (u: HRMSUser | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('hrms_user', JSON.stringify(u));
      Cookies.set('auth_token', 'mock_token_' + (u.employeeId || 'user'), { expires: 7, sameSite: 'lax' });
    } else {
      localStorage.removeItem('hrms_user');
      Cookies.remove('auth_token');
    }
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem('hrms_user');
    Cookies.remove('auth_token');
    window.location.href = '/login';
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
