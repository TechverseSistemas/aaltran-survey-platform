'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUpdatePosition } from '@/hooks/use-positions';
import { positionSchema } from '@/schemas/organizational';
import { useSelectedCompanyStore } from '@/store/selected-company';
import { useSelectedDepartmentStore } from '@/store/selected-department';
import { Position } from '@/types/organizational';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

interface Props {
  position: Position;
}

export default function EditPositionDialog({ position }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { selectedDepartment } = useSelectedDepartmentStore();
  const { selectedCompany } = useSelectedCompanyStore();

  const { mutate: CreatePosition } = useUpdatePosition(
    selectedCompany?.id,
    selectedDepartment?.id,
    position?.id
  );

  const form = useForm<z.infer<typeof positionSchema>>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      name: position?.name || '',
    },
  });

  function handleOpenChange(open: boolean) {
    setIsDialogOpen(open);

    if (!open) {
      form.reset();
    }
  }

  function onSubmit(values: z.infer<typeof positionSchema>) {
    try {
      CreatePosition(values);
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
    }
  }

  useEffect(() => {
    if (isDialogOpen && position) {
      form.reset({
        name: position.name,
      });
    }
  }, [isDialogOpen, position, form]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Cargo</DialogTitle>
          <DialogDescription>Preencha os dados do cargo</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do cargo</FormLabel>

                  <FormControl>
                    <Input placeholder="Nome do cargo" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>

              <Button type="submit">Editar Cargo</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
