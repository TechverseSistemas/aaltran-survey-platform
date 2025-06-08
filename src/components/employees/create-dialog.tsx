'use client';

import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetCompaniesQuery } from '@/hooks/use-companies';
import { useCreateEmployee } from '@/hooks/use-employees';
import { cn } from '@/lib/utils';
import { employeeCreateSchema } from '@/schemas/employee';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { z } from 'zod';
import { Calendar } from '../ui/calendar';
import { Checkbox } from '../ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { PasswordInput } from '../input-password';
import { useSelectedCompanyStore } from '@/store/selected-company';

export default function CreateEmployeeDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { selectedCompany } = useSelectedCompanyStore();

  const { data } = useGetCompaniesQuery();

  const { mutate: createEmployee } = useCreateEmployee(selectedCompany?.id);

  const form = useForm<z.infer<typeof employeeCreateSchema>>({
    resolver: zodResolver(employeeCreateSchema),
    defaultValues: {
      id_section: '',
      id_departament: '',
      name: '',
      cpf: '',
      birth_date: new Date(),
      gender: undefined,
      scholarity: undefined,
      admission_date: new Date(),
      leader: false,
    },
  });

  function handleOpenChange(open: boolean) {
    setIsDialogOpen(open);

    if (!open) {
      form.reset();
    }
  }

  function onSubmit(values: z.infer<typeof employeeCreateSchema>) {
    try {
      createEmployee(values);
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
          Novo Funcionário
        </Button>
      </DialogTrigger>

      <DialogContent className="no-scrollbar h-full max-h-[80vh] w-full max-w-md overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Funcionário</DialogTitle>
          <DialogDescription>Preencha os dados do colaborador</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>

                  <FormControl>
                    <Input placeholder="Nome completo do funcionário" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <IMaskInput
                      mask={'000.000.000-00'}
                      placeholder="Digite o CPF"
                      className={cn(
                        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                        fieldState.error && 'border-destructive'
                      )}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>

                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecionar gênero" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="id_departament"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>

                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecionar departamento" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="1">Tecnologia</SelectItem>
                        <SelectItem value="2">Gestão</SelectItem>
                        <SelectItem value="3">Recursos Humanos</SelectItem>
                        <SelectItem value="4">Vendas</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="id_section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>

                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={cn('w-full')}>
                        <SelectValue placeholder="Selecionar empresa" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="1">Desenvolvedor</SelectItem>
                        <SelectItem value="2">Gerente de Projetos</SelectItem>
                        <SelectItem value="3">Analista de Sistemas</SelectItem>
                        <SelectItem value="4">Especialista em Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="admission_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de admissão</FormLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'dd/MM/yyyy')
                          ) : (
                            <span>Selecionar data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        captionLayout="dropdown-buttons"
                        fromYear={new Date().getFullYear() - 100}
                        toYear={new Date().getFullYear()}
                        classNames={{
                          caption_label: 'hidden',
                          vhidden: 'hidden',
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de nascimento</FormLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'dd/MM/yyyy')
                          ) : (
                            <span>Selecionar data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        captionLayout="dropdown-buttons"
                        fromYear={new Date().getFullYear() - 100}
                        toYear={new Date().getFullYear()}
                        classNames={{
                          caption_label: 'hidden',
                          vhidden: 'hidden',
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scholarity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escolaridade</FormLabel>

                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecionar escolaridade" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="ensino_fundamental">Ensino Fundamental</SelectItem>
                        <SelectItem value="ensino_medio">Ensino Médio</SelectItem>
                        <SelectItem value="ensino_superior">Ensino Superior</SelectItem>
                        <SelectItem value="pos_graduacao">Pós-Graduação</SelectItem>
                        <SelectItem value="mestrado">Mestrado</SelectItem>
                        <SelectItem value="doutorado">Doutorado</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leader"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-1 pt-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>

                  <FormLabel>Líder do setor</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>

              <Button type="submit">Cadastrar funcionário</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
