'use client';

import { useGetEmployees } from '@/hooks/use-employees';
import { useSelectedCompanyStore } from '@/store/selected-company';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { Avatar } from '../ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import DeleteEmployeeDialog from './delete-dialog';
import EditEmployeeDialog from './edit-dialog';
import { Employee } from '@/types/employees';
import { toast } from 'sonner';

export default function EmployeesList() {
  const { selectedCompany } = useSelectedCompanyStore();

  const { data: employees, isError, error } = useGetEmployees(selectedCompany?.id);

  function getEmployeeInitials(employee: Employee) {
    const names = employee.name.trim().split(' ');

    if (names.length === 1) {
      return names[0][0];
    }

    return names[0][0] + names[names.length - 1][0];
  }

  if (isError) {
    console.log(error);
    toast.error(`${error.message ?? 'Ocorreu um erro ao carregar funcionários'}`, {
      description: 'Tente novamente mais tarde.',
      action: {
        label: 'Recarregar',
        onClick: () => {
          window.location.reload();
        },
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Funcionários</CardTitle>
        <CardDescription>{employees?.length ?? 0} funcionário(s) encontrado(s)</CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {employees?.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="flex items-center justify-center border border-gray-300 bg-gray-200">
                      <AvatarFallback>{getEmployeeInitials(employee)}</AvatarFallback>
                    </Avatar>

                    <p className="font-medium">{employee.name}</p>
                  </div>
                </TableCell>
                <TableCell>{employee.departmentName}</TableCell>
                <TableCell>{employee.positionName}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <EditEmployeeDialog employee={employee} />

                    <DeleteEmployeeDialog employee={employee} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
