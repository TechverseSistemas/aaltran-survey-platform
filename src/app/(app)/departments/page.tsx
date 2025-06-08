import CreateDepartmentDialog from '@/components/departments/create-dialog';
import DepartmentsList from '@/components/departments/list';

export default function Positions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Departamentos</h1>

        <CreateDepartmentDialog />
      </div>

      <DepartmentsList />
    </div>
  );
}
