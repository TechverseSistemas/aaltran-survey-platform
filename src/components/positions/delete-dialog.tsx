'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDeletePosition } from '@/hooks/use-positions';
import { useSelectedCompanyStore } from '@/store/selected-company';
import { useSelectedDepartmentStore } from '@/store/selected-department';
import { Position } from '@/types/organizational';
import { Trash2 } from 'lucide-react';

interface Props {
  position: Position;
}

export default function DeletePositionDialog({ position }: Props) {
  const { selectedCompany } = useSelectedCompanyStore();
  const { selectedDepartment } = useSelectedDepartmentStore();

  const { mutateAsync: DeletePosition, isPending } = useDeletePosition(
    selectedCompany?.id,
    selectedDepartment?.id,
    position?.id
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o cargo {position.name}? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            onClick={() => DeletePosition()}
            className="bg-red-600 hover:bg-red-700"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
