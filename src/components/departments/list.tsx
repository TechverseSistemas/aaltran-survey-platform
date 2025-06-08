'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetDepartments } from '@/hooks/use-departments';
import { useSelectedCompanyStore } from '@/store/selected-company';
import DeleteDepartmentDialog from './delete-dialog';
import EditDepartmentDialog from './edit-dialog';

export default function DepartmentsList() {
  const { selectedCompany } = useSelectedCompanyStore();

  const { data } = useGetDepartments(selectedCompany?.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Departamentos</CardTitle>
        <CardDescription>{data?.length ?? 0} departamentos(s) encontrado(s)</CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data?.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <EditDepartmentDialog department={department} />

                    <DeleteDepartmentDialog department={department} />
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
