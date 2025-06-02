import { Timestamp } from 'firebase/firestore';
export interface CompanyFocaLPoint {
  name: string;
  email: string;
  phone: string;
}
export interface Company {
  id?: string;
  cnpj: string;
  fantasy_name: string;
  full_address: string;
  focal_point: CompanyFocaLPoint;
  owner: string;
  created_at: Timestamp;
}
