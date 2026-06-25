'use client';

import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { loginWithPassword, logout } from "../lib/auth/authService";
import { setCredentials, clearCredentials, AuthUser } from "../store/authSlice";

export type SessionContextValue = {
	isAuthenticated: boolean;
	user: AuthUser | null;
	login: (args: { email: string; password: string }) => Promise<void>;
	logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: PropsWithChildren) {
	const dispatch = useDispatch();
	const [user, setUser] = useState<AuthUser | null>(null);
	const isAuthenticated = Boolean(user);

	const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
		const res = await loginWithPassword(email, password);
		const nextUser: AuthUser | null =
			res.user ? { id: res.user.id, name: res.user.name, email: res.user.email } : null;
		setUser(nextUser);
		dispatch(setCredentials({ user: nextUser }));
	}, [dispatch]);

	const signOut = useCallback(async () => {
		await logout();
		setUser(null);
		dispatch(clearCredentials());
	}, [dispatch]);

	const value = useMemo<SessionContextValue>(() => {
		return {
			isAuthenticated,
			user,
			login,
			logout: signOut,
		};
	}, [isAuthenticated, login, signOut, user]);

	return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
	const ctx = useContext(SessionContext);
	if (!ctx) throw new Error("useSession must be used within SessionProvider");
	return ctx;
}


