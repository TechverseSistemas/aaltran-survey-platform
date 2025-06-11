'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetDepartments } from '@/hooks/use-departments';
import { useUpdateEmployee } from '@/hooks/use-employees';
import { useGetPositions } from '@/hooks/use-positions';
import { cn } from '@/lib/utils';
import { employeeUpdateSchema } from '@/schemas/employees';
import { useSelectedCompanyStore } from '@/store/selected-company';
import { Employee } from '@/types/employees';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { toast } from 'sonner';
import z from 'zod';

interface Props {
  employee: Employee;
}

export default function EditEmployeeDialog({ employee }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { selectedCompany } = useSelectedCompanyStore();

  const form = useForm<z.infer<typeof employeeUpdateSchema>>({
    resolver: zodResolver(employeeUpdateSchema),
    defaultValues: {
      positionId: '',
      departmentId: '',
      name: '',
      cpf: '',
      birth_date: new Date(),
      gender: undefined,
      scholarity: undefined,
      admission_date: new Date(),
      isLeader: false,
    },
  });

  const watchedDepartmentId = form.watch('departmentId');

  const { mutateAsync: CreateEmployee, isPending } = useUpdateEmployee(
    selectedCompany?.id,
    employee?.id
  );
  const { data: departments } = useGetDepartments(selectedCompany?.id);
  const { data: positions } = useGetPositions(selectedCompany?.id, watchedDepartmentId);

  function handleOpenChange(open: boolean) {
    setIsDialogOpen(open);

    if (!open) {
      form.reset();
    }
  }

  function onSubmit(values: z.infer<typeof employeeUpdateSchema>) {
    try {
      CreateEmployee(values);

      setIsDialogOpen(false);
      form.reset();
      toast.success('Funcionário editado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      toast.error('Ocorreu um erro ao editar o funcionário. Tente novamente mais tarde.', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  useEffect(() => {
    if (isDialogOpen && employee) {
      form.reset({
        name: employee.name,
        cpf: employee.cpf,
        departmentId: employee.departmentId,
        positionId: employee.positionId,
        isLeader: employee.isLeader,
        gender: employee.gender,
        scholarity: employee.scholarity,
        birth_date: new Date(employee.birth_date),
        admission_date: new Date(employee.admission_date),
      });
    }
  }, [isDialogOpen, employee, form]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Funcionário</DialogTitle>
          <DialogDescription>Preencha os dados do funcionário</DialogDescription>
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
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>

                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecionar departamento" />
                      </SelectTrigger>

                      <SelectContent>
                        {departments?.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="positionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>

                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!watchedDepartmentId || !positions || positions.length === 0}
                    >
                      <SelectTrigger className={cn('w-full')}>
                        <SelectValue placeholder="Selecionar empresa" />
                      </SelectTrigger>

                      <SelectContent>
                        {positions?.map((position) => (
                          <SelectItem key={position.id} value={position.id}>
                            {position.name}
                          </SelectItem>
                        ))}
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
                        <SelectItem value="Ensino Fundamental">Ensino Fundamental</SelectItem>
                        <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                        <SelectItem value="Ensino Superior">Ensino Superior</SelectItem>
                        <SelectItem value="Pós-Graduação">Pós-Graduação</SelectItem>
                        <SelectItem value="Mestrado">Mestrado</SelectItem>
                        <SelectItem value="Doutorado">Doutorado</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isLeader"
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

              <Button disabled={isPending} type="submit">
                Editar Funcionário
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
