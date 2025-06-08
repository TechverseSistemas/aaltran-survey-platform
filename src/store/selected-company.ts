import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Company } from '../types/companies';

type State = {
  selectedCompany: Company | null;
};

type Actions = {
  setSelectedCompany: (company: Company | null) => void;
};

export const useSelectedCompanyStore = create(
  persist<State & Actions>(
    (set) => ({
      selectedCompany: null,
      setSelectedCompany: (company) => set({ selectedCompany: company }),
    }),
    {
      name: 'selected-company',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
