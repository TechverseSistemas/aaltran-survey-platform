export type Gender = 'Masculino' | 'Feminino';
export type Scholarity =
  | 'Ensino Fundamental'
  | 'Ensino Médio'
  | 'Ensino Superior'
  | 'Pós-Graduação'
  | 'Mestrado'
  | 'Doutorado';

export interface Employee {
  id: string;
  departmentId: string;
  departmentName?: string;
  positionId: string;
  positionName?: string;
  name: string;
  login: string;
  password?: string;
  role: 'employee' | 'company_admin' | 'super_admin';
  cpf: string;
  birth_date: Date;
  admission_date: Date;
  gender: Gender;
  scholarity: Scholarity;
  isLeader: boolean;
  reportsTo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FullEmployee extends Employee {
  departmentName: string;
  positionName: string;
}
