import { create } from "zustand";

type UiState = {
	isSidebarOpen: boolean;
	openSidebar: () => void;
	closeSidebar: () => void;
	toggleSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
	isSidebarOpen: false,
	openSidebar: () => set({ isSidebarOpen: true }),
	closeSidebar: () => set({ isSidebarOpen: false }),
	toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
}));


