'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Search, Users, Mail, Building2, Edit, Trash2, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const funcionarios = [
    {
      id: 1,
      nome: 'Ana Silva Santos',
      cpf: '123.456.789-01',
      email: 'ana.silva@techcorp.com',
      telefone: '(11) 99999-1111',
      empresa: 'TechCorp Ltda',
      departamento: 'Tecnologia',
      cargo: 'Desenvolvedora Senior',
      dataAdmissao: '2022-03-15',
      status: 'Ativo',
      salario: 'R$ 8.500,00',
    },
    {
      id: 2,
      nome: 'Carlos Eduardo Santos',
      cpf: '987.654.321-02',
      email: 'carlos.santos@techcorp.com',
      telefone: '(11) 99999-2222',
      empresa: 'TechCorp Ltda',
      departamento: 'Gestão',
      cargo: 'Gerente de Projetos',
      dataAdmissao: '2021-08-10',
      status: 'Ativo',
      salario: 'R$ 12.000,00',
    },
    {
      id: 3,
      nome: 'Maria Costa Lima',
      cpf: '456.789.123-03',
      email: 'maria.costa@inovacao.com',
      telefone: '(11) 99999-3333',
      empresa: 'Inovação S.A.',
      departamento: 'Dados',
      cargo: 'Analista de Dados',
      dataAdmissao: '2023-01-20',
      status: 'Ativo',
      salario: 'R$ 6.800,00',
    },
    {
      id: 4,
      nome: 'João Oliveira Souza',
      cpf: '789.123.456-04',
      email: 'joao.oliveira@crescimento.com',
      telefone: '(11) 99999-4444',
      empresa: 'Crescimento Inc',
      departamento: 'Design',
      cargo: 'Designer UX',
      dataAdmissao: '2022-11-05',
      status: 'Férias',
      salario: 'R$ 7.200,00',
    },
  ];

  const empresas = [
    { value: 'all', label: 'Todas as Empresas' },
    { value: 'techcorp', label: 'TechCorp Ltda' },
    { value: 'inovacao', label: 'Inovação S.A.' },
    { value: 'crescimento', label: 'Crescimento Inc' },
  ];

  const departamentos = [
    { value: 'all', label: 'Todos os Departamentos' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'gestao', label: 'Gestão' },
    { value: 'dados', label: 'Dados' },
    { value: 'design', label: 'Design' },
    { value: 'rh', label: 'Recursos Humanos' },
    { value: 'vendas', label: 'Vendas' },
  ];

  const filteredFuncionarios = funcionarios.filter((funcionario) => {
    const matchesSearch =
      funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.cpf.includes(searchTerm) ||
      funcionario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany =
      selectedCompany === 'all' || funcionario.empresa.toLowerCase().includes(selectedCompany);

    const matchesDepartment =
      selectedDepartment === 'all' ||
      funcionario.departamento.toLowerCase().includes(selectedDepartment);

    return matchesSearch && matchesCompany && matchesDepartment;
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie os colaboradores cadastrados no sistema</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Funcionário</DialogTitle>
              <DialogDescription>Preencha os dados do colaborador</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" placeholder="Nome completo do funcionário" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" placeholder="000.000.000-00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(11) 99999-9999" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="techcorp">TechCorp Ltda</SelectItem>
                      <SelectItem value="inovacao">Inovação S.A.</SelectItem>
                      <SelectItem value="crescimento">Crescimento Inc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="gestao">Gestão</SelectItem>
                      <SelectItem value="rh">Recursos Humanos</SelectItem>
                      <SelectItem value="vendas">Vendas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" placeholder="Cargo do funcionário" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataAdmissao">Data de Admissão</Label>
                  <Input id="dataAdmissao" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salario">Salário</Label>
                  <Input id="salario" placeholder="R$ 0,00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="ferias">Férias</SelectItem>
                      <SelectItem value="licenca">Licença</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>Cadastrar Funcionário</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, CPF, email ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            {empresas.map((empresa) => (
              <SelectItem key={empresa.value} value={empresa.value}>
                {empresa.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            {departamentos.map((dept) => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtros Avançados
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funcionarios.length}</div>
            <p className="text-muted-foreground text-xs">Colaboradores cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários Ativos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {funcionarios.filter((f) => f.status === 'Ativo').length}
            </div>
            <p className="text-muted-foreground text-xs">Em atividade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(funcionarios.map((f) => f.empresa)).size}
            </div>
            <p className="text-muted-foreground text-xs">Empresas representadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(funcionarios.map((f) => f.departamento)).size}
            </div>
            <p className="text-muted-foreground text-xs">Áreas de atuação</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Funcionários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
          <CardDescription>
            {filteredFuncionarios.length} funcionário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFuncionarios.map((funcionario) => (
                <TableRow key={funcionario.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {funcionario.nome
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{funcionario.nome}</p>
                        <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                          <Mail className="h-3 w-3" />
                          <span>{funcionario.email}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{funcionario.empresa}</TableCell>
                  <TableCell>{funcionario.departamento}</TableCell>
                  <TableCell>{funcionario.cargo}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        funcionario.status === 'Ativo'
                          ? 'default'
                          : funcionario.status === 'Férias'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {funcionario.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
