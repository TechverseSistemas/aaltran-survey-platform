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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { clientCompanyService } from '@/lib/services/companies.service';
import { Company } from '@/lib/types/companies.type';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Mail, Phone, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { z } from 'zod';

const companyFocalPointSchema = z.object({
  name: z.string().min(1, { message: 'O nome do ponto focal é obrigatório.' }),
  email: z
    .string()
    .email({ message: 'Formato de e-mail inválido.' })
    .min(1, { message: 'O e-mail é obrigatório.' }),
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, {
      // Ajustado para o formato (XX) XXXXX-XXXX (com 9 dígitos)
      message: 'Formato de telefone inválido. Use (XX) XXXXX-XXXX.',
    })
    .min(1, { message: 'O telefone é obrigatório.' })
    .or(
      z.string().regex(/^\(\d{2}\)\s\d{4}-\d{4}$/, {
        message: 'Formato de telefone inválido. Use (XX) XXXX-XXXX.',
      })
    ),
});

const companyFormSchema = z.object({
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
      message: 'Formato de CNPJ inválido. Use XX.XXX.XXX/XXXX-XX.',
    })
    .min(1, { message: 'O CNPJ é obrigatório.' }),
  fantasy_name: z.string().min(1, { message: 'O nome fantasia é obrigatório.' }),
  full_address: z.string().min(1, { message: 'O endereço completo é obrigatório.' }),
  focal_point: companyFocalPointSchema,
  owner: z.string().min(1, { message: 'O nome do proprietário é obrigatório.' }),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

const cnpjMask = '00.000.000/0000-00';

const phoneMaskDefinition = [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }];

export default function CompaniesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filteredEmpresas, setFilteredEmpresas] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formType, setFormType] = useState<'create' | 'edit'>('create');
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
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

  async function onSubmit(values: CompanyFormData) {
    if (formType === 'edit') {
      const editValues: Partial<Company> = {
        ...selectedCompany,
        ...values,
      };
      const response = await fetch(`/api/companies/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Erro ao editar empresa: ${errorData.msgRet}`);
        return;
      }
      form.reset();
      setIsDialogOpen(false);
      return;
    }
    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    console.log('Response:', response);
    if (!response.ok) {
      const errorData = await response.json();
      alert(`Erro ao cadastrar empresa: ${errorData.msgRet}`);
      return;
    }
    form.reset();
    setIsDialogOpen(false);
  }

  async function fetchCompanies() {
    const req = await fetch('/api/companies', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const companies = await req.json();
    setCompanies(companies);
  }

  useEffect(() => {
    fetchCompanies();
  }, []);

  const shadcnInputClassName =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">
            Gerencie as empresas clientes cadastradas no sistema
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormType('create');
                setSelectedCompany(null);
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

                <fieldset className="mt-4 rounded-md border p-4">
                  <legend className="mb-2 px-1 text-lg font-medium text-gray-900">
                    Ponto Focal
                  </legend>
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
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting
                      ? 'Salvando...'
                      : formType == 'create'
                        ? 'Cadastrar Empresa'
                        : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((empresa) => (
          <Card key={empresa.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{empresa.fantasy_name}</CardTitle>
                </div>
              </div>
              <CardDescription>CNPJ: {empresa.cnpj}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Ponto Focal: {empresa.focal_point.name}</p>
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <Mail className="h-3 w-3" />
                  <span>{empresa.focal_point.email}</span>
                </div>
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <Phone className="h-3 w-3" />
                  <span>{empresa.focal_point.phone}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={async () => {
                    setFormType('edit');
                    setSelectedCompany(empresa);
                    if (empresa) {
                      form.reset({
                        cnpj: empresa.cnpj,
                        fantasy_name: empresa.fantasy_name,
                        full_address: empresa.full_address,
                        focal_point: {
                          name: empresa.focal_point.name,
                          email: empresa.focal_point.email,
                          phone: empresa.focal_point.phone,
                        },
                        owner: empresa.owner,
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
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button variant="destructive" size="sm" className="flex-1">
                      Deletar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deseja realmente Deletar essa empresa ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and
                        remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          
                          const response = await fetch('/api/companies', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: empresa.id }),
                          });
                          if (!response.ok) {
                            const errorData = await response.json();
                            alert(`Erro ao deletar empresa: ${errorData.msgRet}`);
                            return;
                          }
                          setCompanies((prev) => prev.filter((c) => c.id !== empresa.id));
                        }}
                      >
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
