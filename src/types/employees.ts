import { Timestamp as AdminTimestamp, FieldValue } from 'firebase-admin/firestore';

type Gender = 'Masculino' | 'Feminino';
type Timestamp = AdminTimestamp | FieldValue;
type Scholarity =
  | 'ensino_fundamental'
  | 'ensino_medio'
  | 'ensino_superior'
  | 'pos_graduacao'
  | 'mestrado'
  | 'doutorado';

export interface Employee {
  id: string;
  id_company: string;
  id_section: string;
  id_departament: string;
  name: string;
  cpf: string;
  birth_date: Date;
  gender: Gender;
  scholarity: Scholarity;
  admission_date: Date;
  leader: boolean;
  login: string;
  password: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}
