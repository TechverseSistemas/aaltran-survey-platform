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
import { useDeleteEmployee } from '@/hooks/use-employees';
import { useSelectedCompanyStore } from '@/store/selected-company';
import { Employee } from '@/types/employees';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  employee: Employee;
}

export default function DeleteEmployeeDialog({ employee }: Props) {
  const { selectedCompany } = useSelectedCompanyStore();

  const { mutateAsync: DeleteEmployee, isPending } = useDeleteEmployee(
    selectedCompany?.id,
    employee?.id
  );

  async function handleDelete() {
    if (!selectedCompany || !employee) {
      return;
    }

    try {
      await DeleteEmployee();

      toast.success('Funcionário excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(
        'Ocorreu um erro ao excluir o funcionário. Por favor, tente novamente mais tarde.',
        {
          description: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      );
    }
  }

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
            Tem certeza que deseja excluir o funcionário {employee.name}? Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
