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
import { useUpdateDepartment } from '@/hooks/use-departments';
import { departmentSchema } from '@/schemas/organizational';
import { useSelectedCompanyStore } from '@/store/selected-company';
import { Department } from '@/types/organizational';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

interface Props {
  department: Department;
}

export default function EditDepartmentDialog({ department }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { selectedCompany } = useSelectedCompanyStore();

  const { mutateAsync: CreateDepartment, isPending } = useUpdateDepartment(
    selectedCompany?.id,
    department?.id
  );

  const form = useForm<z.infer<typeof departmentSchema>>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name || '',
    },
  });

  function handleOpenChange(open: boolean) {
    setIsDialogOpen(open);

    if (!open) {
      form.reset();
    }
  }

  async function onSubmit(values: z.infer<typeof departmentSchema>) {
    try {
      await CreateDepartment(values);

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
    }
  }

  useEffect(() => {
    if (isDialogOpen && department) {
      form.reset({
        name: department.name,
      });
    }
  }, [isDialogOpen, department, form]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Departamento</DialogTitle>
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

              <Button disabled={isPending} type="submit">
                Editar Departamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
