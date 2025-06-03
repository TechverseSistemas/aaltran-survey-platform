import { create } from 'zustand';
import { Company } from '../types/companies.type';

interface CompaniesStore {
  companies: Company[] | null;
  setCompanies: (companies: Company[]) => void;
  clearCompanies: () => void;
}

export const useCompaniesStore = create<CompaniesStore>((set) => ({
  companies: null,
  setCompanies: (companies: Company[]) => set({ companies }),
  clearCompanies: () => set({ companies: null }),
}));
