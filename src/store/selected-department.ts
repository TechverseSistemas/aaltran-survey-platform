import { Department } from '@/types/organizational';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type State = {
  selectedDepartment: Department | null;
};

type Actions = {
  setSelectedDepartment: (department: Department | null) => void;
};

export const useSelectedDepartmentStore = create(
  persist<State & Actions>(
    (set) => ({
      selectedDepartment: null,
      setSelectedDepartment: (department) => set({ selectedDepartment: department }),
    }),
    {
      name: 'selected-department',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
