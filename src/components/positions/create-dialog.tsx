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
import { useCreatePosition } from '@/hooks/use-positions';
import { positionSchema } from '@/schemas/organizational';
import { useSelectedCompanyStore } from '@/store/selected-company';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { useSelectedDepartmentStore } from '@/store/selected-department';

export default function CreatePositionDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { selectedCompany } = useSelectedCompanyStore();
  const { selectedDepartment } = useSelectedDepartmentStore();

  const { mutate: CreatePosition } = useCreatePosition(selectedCompany?.id, selectedDepartment?.id);

  const form = useForm<z.infer<typeof positionSchema>>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      name: '',
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

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Novo Cargo
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

              <Button type="submit">Criar Cargo</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
