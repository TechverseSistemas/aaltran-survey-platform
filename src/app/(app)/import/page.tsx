'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
import { useImportXml } from '@/hooks/use-import';
import type { Company } from '@/types/companies';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';

export default function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  type ImportResults = {
    total: number;
    sucesso: number;
    erros: number;
    jaCadastrados: number;
  };
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const { mutateAsync: importXml } = useImportXml();
  const { data } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
    staleTime: 1000 * 60 * 5, // 5 minutes // 1 hour
  });
  async function fetchCompanies() {
    const req = await fetch('/api/companies', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const companies: Company[] = await req.json();
    return companies;
  }

  const importHistory = [
    {
      id: 1,
      arquivo: 'funcionarios_techcorp_2024.xlsx',
      empresa: 'TechCorp Ltda',
      data: '2024-01-15 14:30',
      registros: 150,
      sucesso: 148,
      erros: 2,
      status: 'Concluído',
    },
    {
      id: 2,
      arquivo: 'colaboradores_inovacao.xlsx',
      empresa: 'Inovação S.A.',
      data: '2024-01-10 09:15',
      registros: 85,
      sucesso: 85,
      erros: 0,
      status: 'Concluído',
    },
    {
      id: 3,
      arquivo: 'dados_crescimento.xlsx',
      empresa: 'Crescimento Inc',
      data: '2024-01-08 16:45',
      registros: 220,
      sucesso: 215,
      erros: 5,
      status: 'Concluído',
    },
  ];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (!selectedFile || !selectedCompany) {
      // You might want to show a warning to the user here
      return;
    }

    setIsImporting(true); // Keep your local loading state if you want
    setImportProgress(0); // Reset progress

    try {
      const formData = new FormData();
      formData.append('companyId', selectedCompany);
      formData.append('file', selectedFile); // Append the actual File object

      console.log('Enviando para importação:', {
        companyId: selectedCompany,
        fileName: selectedFile.name, // Log file name for debugging
      });

      // Call the mutation with FormData
      await importXml(formData, {
        onSuccess: (data) => {
          setImportProgress(100);
          setImportResults({
            total: data.successCount + data.failedCount, // Assuming total is sum of success and failed
            sucesso: data.successCount,
            erros: data.failedCount,
            jaCadastrados: 0, // Your backend doesn't explicitly return this, adjust if needed
          });
        },
        onError: (error) => {
          console.error('Erro ao importar o arquivo:', error);
          setImportResults({
            total: 0,
            sucesso: 0,
            erros: 1, // Indicate an error occurred
            jaCadastrados: 0,
          });
        },
        onSettled: () => {
          setIsImporting(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      });
    } catch (error) {
      console.error('Erro ao processar o arquivo:', error);
      setImportResults({
        total: 0,
        sucesso: 0,
        erros: 1,
        jaCadastrados: 0,
      });
      setIsImporting(false); // Ensure loading state is reset even if catch block is hit directly
    }
    // Remove the finally block, as onSuccess/onError/onSettled in mutate options handle cleanup
  }, [selectedFile, selectedCompany, importXml]);

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/template-funcionarios.xlsx';
    link.download = 'template-funcionarios.xlsx';
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Importar Excel</h1>
          <p className="text-muted-foreground">
            Importe dados de funcionários em lote através de planilhas Excel
          </p>
        </div>

        <Button onClick={downloadTemplate} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Baixar Template
        </Button>
      </div>

      {/* Instruções */}
      <Alert>
        <FileSpreadsheet className="h-4 w-4" />
        <AlertDescription>
          <strong>Instruções:</strong> Baixe o template Excel, preencha com os dados dos
          funcionários e faça o upload. Certifique-se de que todos os campos obrigatórios estejam
          preenchidos corretamente.
        </AlertDescription>
      </Alert>

      {/* Formulário de Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivo</CardTitle>
          <CardDescription>Selecione a empresa e o arquivo Excel para importação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa de Destino</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  {data?.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.fantasy_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arquivo">Arquivo Excel</Label>
              <Input
                id="arquivo"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                ref={fileInputRef}
                disabled={isImporting}
              />
            </div>
          </div>

          {selectedFile && (
            <div className="bg-muted flex items-center space-x-2 rounded-lg p-3">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-muted-foreground text-xs">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={isImporting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {isImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando arquivo...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleImport}
              disabled={!selectedFile || !selectedCompany || isImporting}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? 'Importando...' : 'Iniciar Importação'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados da Importação */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Importação Concluída</span>
            </CardTitle>
            <CardDescription>Resumo do processo de importação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div className="text-center">
                <div className="text-2xl font-bold">{importResults.total}</div>
                <p className="text-muted-foreground text-xs">Total de Registros</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importResults.sucesso}</div>
                <p className="text-muted-foreground text-xs">Cadastrados com Sucesso</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{importResults.erros}</div>
                <p className="text-muted-foreground text-xs">Erros</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {importResults.jaCadastrados}
                </div>
                <p className="text-muted-foreground text-xs">Já cadastrado</p>
              </div>
            </div>

            {importResults.erros > 0 && (
              <div className="mt-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Alguns registros não puderam ser importados. Baixe o relatório de erros para
                    mais detalhes.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    // Criar arquivo excel com os dados dos funcionarios e seus erros
                    downloadTemplate();
                  }}
                >
                  <Download className="mr-2 h-3 w-3" />
                  Baixar Relatório de Erros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Histórico de Importações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Importações</CardTitle>
          <CardDescription>Últimas importações realizadas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Registros</TableHead>
                <TableHead>Sucesso</TableHead>
                <TableHead>Erros</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{item.arquivo}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.empresa}</TableCell>
                  <TableCell>{item.data}</TableCell>
                  <TableCell>{item.registros}</TableCell>
                  <TableCell className="text-green-600">{item.sucesso}</TableCell>
                  <TableCell className={item.erros > 0 ? 'text-red-600' : 'text-muted-foreground'}>
                    {item.erros}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{item.status}</Badge>
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
