// src/types/companies.ts

import { FieldValue } from 'firebase-admin/firestore';

type FirestoreTimestamp = Date | FieldValue;

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
  owner: string;
  focal_point: CompanyFocalPoint;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}
