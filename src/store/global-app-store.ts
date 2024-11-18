import { create } from "zustand";
import { produce } from "immer";

type State = { isSidebarOpen: boolean; isSidebarMinimised: boolean };
type Actions = {
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  toggleSidebar: () => void;
  setIsSidebarMinimised: (isSidebarMinimised: boolean) => void;
  toggleSidebarMinimised: () => void;
};

export const useGlobalAppStore = create<State & Actions>((set) => ({
  isSidebarOpen: false,
  isSidebarMinimised: false,
  setIsSidebarOpen(isSidebarOpen) {
    set(
      produce((state: State) => {
        state.isSidebarOpen = isSidebarOpen;
      }),
    );
  },
  toggleSidebar() {
    set(
      produce((state: State) => {
        state.isSidebarOpen = !state.isSidebarOpen;
      }),
    );
  },
  setIsSidebarMinimised(isSidebarMinimised) {
    set(
      produce((state: State) => {
        state.isSidebarMinimised = isSidebarMinimised;
      }),
    );
  },
  toggleSidebarMinimised() {
    set(
      produce((state: State) => {
        state.isSidebarMinimised = !state.isSidebarMinimised;
      }),
    );
  },
}));
