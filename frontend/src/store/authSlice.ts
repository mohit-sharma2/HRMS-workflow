import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
	id: string;
	email?: string;
	name?: string;
};

export type AuthState = {
	isAuthenticated: boolean;
	user: AuthUser | null;
};

const initialState: AuthState = {
	isAuthenticated: false,
	user: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setCredentials: (state, action: PayloadAction<{ user: AuthUser | null }>) => {
			state.user = action.payload.user;
			state.isAuthenticated = Boolean(action.payload.user);
		},
		clearCredentials: (state) => {
			state.user = null;
			state.isAuthenticated = false;
		},
	},
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;


