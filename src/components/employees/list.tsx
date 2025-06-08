'use client';

import { useGetEmployees } from '@/hooks/use-employees';
import { useSelectedCompanyStore } from '@/store/selected-company';

export default function EmployeesList() {
  const { selectedCompany } = useSelectedCompanyStore();

  const { data: employees, isLoading } = useGetEmployees(selectedCompany?.id);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!employees || employees.length === 0) {
    return <div>Nenhum funcionário encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Lista de Funcionários</h2>
      <ul className="list-disc pl-5">
        {employees.map((employee) => (
          <li key={employee.id} className="py-2">
            {employee.name} - {employee.id}
          </li>
        ))}
      </ul>
    </div>
  );
}
