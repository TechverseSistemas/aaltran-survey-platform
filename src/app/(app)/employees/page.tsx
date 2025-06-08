import CreateEmployeeDialog from '@/components/employees/create-dialog';
import EmployeesList from '@/components/employees/list';

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>

        <CreateEmployeeDialog />
      </div>

      <EmployeesList />
    </div>
  );
}
