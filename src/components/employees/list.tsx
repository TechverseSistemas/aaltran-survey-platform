'use client';

import { useGetEmployees } from '@/hooks/use-employees';

export default function EmployeesList() {
  const { data: employees, isLoading } = useGetEmployees();

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
