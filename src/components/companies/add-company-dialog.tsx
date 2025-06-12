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
import { useCreateCompanyMutation } from '@/hooks/use-companies';
import { cn } from '@/lib/utils';
import { companyCreateSchema } from '@/schemas/companies';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { toast } from 'sonner';
import z from 'zod';

const cnpjMask = '00.000.000/0000-00';

const phoneMaskDefinition = [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }];

export default function AddCompanyDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutateAsync: handleCreate, isPending } = useCreateCompanyMutation();

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
      await handleCreate(values);
      form.reset();
      setIsDialogOpen(false);
      toast.success('Empresa adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar Empresa:', error);
      toast.error('Ocorreu um erro ao criar a Empresa. Tente novamente mais tarde.', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            form.reset({
              cnpj: '',
              fantasy_name: '',
              full_address: '',
              focal_point: { name: '', email: '', phone: '' },
              owner: '',
            });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
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
                {isPending ? 'Salvando...' : 'Criar Empresa'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
