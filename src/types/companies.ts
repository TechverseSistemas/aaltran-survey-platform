import { Timestamp as AdminTimestamp, FieldValue } from 'firebase-admin/firestore';

export interface CompanyFocalPoint {
  name: string;
  email: string;
  phone: string;
}

export interface Company {
  id: string;
  cnpj: string;
  fantasy_name: string;
  full_address: string;
  focal_point: CompanyFocalPoint;
  owner: string;
  created_at?: AdminTimestamp | FieldValue;
  updated_at?: AdminTimestamp | FieldValue;
}
