'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { companyCreateSchema } from '@/schemas/companies';
import { Company } from '@/types/companies';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { toast } from 'sonner';
import { z } from 'zod';

const cnpjMask = '00.000.000/0000-00';

const phoneMaskDefinition = [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }];

export default function EditCompanyDialog({ company }: { company: Company | null }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const queryClient = useQueryClient();
  const { mutateAsync: handleEdit, isPending } = useMutation({
    mutationFn: async (editValues: Company) => {
      const response = await fetch(`/api/companies/${company?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar empresa');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const shadcnInputClassName =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const form = useForm<z.infer<typeof companyCreateSchema>>({
    resolver: zodResolver(companyCreateSchema),
    defaultValues: {
      cnpj: '',
      fantasy_name: '',
      full_address: '',
      focal_point: {
        name: '',
        email: '',
        phone: '',
      },
      owner: '',
    },
  });

  async function onSubmit(values: z.infer<typeof companyCreateSchema>) {
    try {
      const editValues: Partial<Company> = {
        ...selectedCompany,
        ...values,
      };
      await handleEdit(editValues as Company);
      form.reset();
      setIsDialogOpen(false);
      toast.success('Empresa editada com sucesso!');
    } catch (error) {
      console.error('Erro ao editar Empresa:', error);
      toast.error('Ocorreu um erro ao editar a Empresa. Tente novamente mais tarde.', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={async () => {
            setSelectedCompany(company);
            if (company) {
              form.reset({
                cnpj: company.cnpj,
                fantasy_name: company.fantasy_name,
                full_address: company.full_address,
                focal_point: {
                  name: company.focal_point.name,
                  email: company.focal_point.email,
                  phone: company.focal_point.phone,
                },
                owner: company.owner,
              });
              setIsDialogOpen(true);
            } else {
              alert('Empresa não encontrada');
            }
          }}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
          <DialogDescription>Preencha os dados da empresa cliente</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <IMaskInput
                        mask={cnpjMask}
                        value={field.value || ''}
                        unmask={false}
                        onAccept={(value) => {
                          field.onChange(value);
                        }}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        name={field.name}
                        placeholder="XX.XXX.XXX/XXXX-XX"
                        className={cn(
                          shadcnInputClassName,
                          fieldState.error && 'border-destructive' // Estilo de erro
                        )}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fantasy_name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Nome Fantasia</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        placeholder="Nome da empresa"
                        className={cn(
                          shadcnInputClassName,
                          fieldState.error && 'border-destructive'
                        )}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="full_address"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Endereço Completo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Endereço completo da empresa"
                      {...field}
                      className={cn(fieldState.error && 'border-destructive')}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="owner"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Nome do Proprietário</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      placeholder="Nome completo do proprietário"
                      className={cn(shadcnInputClassName, fieldState.error && 'border-destructive')}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <fieldset className="mt-4 rounded-md border p-4">
              <legend className="mb-2 px-1 text-lg font-medium text-gray-900">Ponto Focal</legend>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="focal_point.name"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          placeholder="Nome do responsável"
                          className={cn(
                            shadcnInputClassName,
                            fieldState.error && 'border-destructive'
                          )}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="focal_point.email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <input
                          type="email"
                          {...field}
                          placeholder="email@empresa.com"
                          className={cn(
                            shadcnInputClassName,
                            fieldState.error && 'border-destructive'
                          )}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="focal_point.phone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <IMaskInput
                          mask={phoneMaskDefinition}
                          value={field.value || ''}
                          unmask={false}
                          onAccept={(value) => {
                            field.onChange(value);
                          }}
                          onBlur={field.onBlur}
                          inputRef={field.ref}
                          name={field.name}
                          placeholder="(XX) XXXXX-XXXX"
                          className={cn(
                            shadcnInputClassName,
                            fieldState.error && 'border-destructive'
                          )}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setIsDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
