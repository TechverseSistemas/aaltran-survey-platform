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
import { useGetPositions } from '@/hooks/use-positions';
import { useSelectedCompanyStore } from '@/store/selected-company';
import { useSelectedDepartmentStore } from '@/store/selected-department';
import DeletePositionDialog from './delete-dialog';
import EditPositionDialog from './edit-dialog';
import SelectDepartment from './select-department';

export default function PositionsList() {
  const { selectedDepartment } = useSelectedDepartmentStore();
  const { selectedCompany } = useSelectedCompanyStore();

  const { data } = useGetPositions(selectedCompany?.id, selectedDepartment?.id);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Lista de Cargos</CardTitle>
          <CardDescription>{data?.length ?? 0} cargo(s) encontrado(s)</CardDescription>
        </div>

        <SelectDepartment />
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
            {data?.map((position) => (
              <TableRow key={position.id}>
                <TableCell className="font-medium">{position.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <EditPositionDialog position={position} />

                    <DeletePositionDialog position={position} />
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
