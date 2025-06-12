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
import { Company } from '@/types/companies';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function DeleteAlert({ company }: { company: Company }) {
  const queryClient = useQueryClient();
  const { mutateAsync: handleDeleteMutation, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/companies/${company?.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar empresa');
      }
      if (response.status === 204) {
        return null;
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  async function handleDelete() {
    try {
      await handleDeleteMutation();
      toast.success('Empresa excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir Empresa:', error);
      toast.error('Ocorreu um erro ao excluir a Empresa. Tente novamente mais tarde.', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="destructive" size="sm" className="flex-1">
          Deletar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a empresa {company.fantasy_name}? Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={async () => {
              handleDelete();
            }}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
