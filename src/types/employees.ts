import { FieldValue } from 'firebase-admin/firestore';

type FirestoreTimestamp = Date | FieldValue;

export type Gender = 'Masculino' | 'Feminino';
export type Scholarity =
  | 'ensino_fundamental'
  | 'ensino_medio'
  | 'ensino_superior'
  | 'pos_graduacao'
  | 'mestrado'
  | 'doutorado';

export interface Employee {
  id: string;
  auth_uid: string;
  departmentId: string;
  jobTitleId: string;
  name: string;
  cpf: string;
  birth_date: FirestoreTimestamp;
  admission_date: FirestoreTimestamp;
  gender: Gender;
  scholarity: Scholarity;
  isLeader: boolean;
  reportsTo?: string; // ID do líder direto (outro employeeId)
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface FullEmployee extends Employee {
  departmentName: string;
  jobTitleName: string;
}
