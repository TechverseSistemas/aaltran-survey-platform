import { Timestamp as AdminTimestamp, FieldValue } from 'firebase-admin/firestore';

export interface Employee {
  id?: string;
  id_company: string;
  company_name: string;
  id_role: string;
  role_name: string;
  id_departament: string;
  departament_name: string;
  leader: boolean;
  name: string;
  cpf: string;
  sex: string;
  birth_date: string;
  scholarity: string;
  admission_date: string;
  login: string;
  password?: string;
  created_at?: AdminTimestamp | FieldValue;
  updated_at?: AdminTimestamp | FieldValue;
}
