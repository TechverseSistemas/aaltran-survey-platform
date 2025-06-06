import CreateEmployeeDialog from '@/components/employees/create-dialog';
import EmployeesList from '@/components/employees/list';

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie os colaboradores cadastrados no sistema</p>
        </div>

        <CreateEmployeeDialog />
      </div>

      <EmployeesList />
    </div>
  );
}
