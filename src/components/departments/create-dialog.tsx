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
import { useCreateDepartment } from '@/hooks/use-departments';
import { departmentSchema } from '@/schemas/organizational';
import { useSelectedCompanyStore } from '@/store/selected-company';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

export default function CreateDepartmentDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { selectedCompany } = useSelectedCompanyStore();

  const { mutate: CreateDepartment } = useCreateDepartment(selectedCompany?.id ?? '');

  const form = useForm<z.infer<typeof departmentSchema>>({
    resolver: zodResolver(departmentSchema),
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

  function onSubmit(values: z.infer<typeof departmentSchema>) {
    try {
      CreateDepartment(values);
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
          Novo Departamento
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Departamento</DialogTitle>
          <DialogDescription>Preencha os dados do departamento</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do departamento</FormLabel>

                  <FormControl>
                    <Input placeholder="Nome do departamento" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>

              <Button type="submit">Criar Departamento</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
