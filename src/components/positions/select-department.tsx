'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetDepartments } from '@/hooks/use-departments';
import { useSelectedCompanyStore } from '@/store/selected-company';
import { useSelectedDepartmentStore } from '@/store/selected-department';

export default function SelectDepartment() {
  const { selectedDepartment, setSelectedDepartment } = useSelectedDepartmentStore();
  const { selectedCompany } = useSelectedCompanyStore();

  const { data, isLoading } = useGetDepartments(selectedCompany?.id);

  function handleDepartmentChange(value: string) {
    const selectedDepartment = data?.find((department) => department.id === value);

    if (selectedDepartment) {
      setSelectedDepartment(selectedDepartment);

      return;
    }

    setSelectedDepartment(null);
  }

  return (
    <Select onValueChange={handleDepartmentChange} value={selectedDepartment?.id || ''}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Empresa" />
      </SelectTrigger>

      <SelectContent>
        {isLoading ? (
          <p className="text-muted-foreground p-2 text-center text-sm">
            Carregando departamentos...
          </p>
        ) : data && data.length > 0 ? (
          data.map((department) => (
            <SelectItem key={department.id} value={department.id}>
              {department.name}
            </SelectItem>
          ))
        ) : (
          <p className="text-muted-foreground p-2 text-center text-sm">
            Nenhum departamento encontrado
          </p>
        )}
      </SelectContent>
    </Select>
  );
}
