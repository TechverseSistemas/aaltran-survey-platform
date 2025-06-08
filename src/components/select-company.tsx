'use client';

import { useGetCompaniesQuery } from '@/hooks/use-companies';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useSelectedCompanyStore } from '@/store/selected-company';

export default function SelectCompany() {
  const { selectedCompany, setSelectedCompany } = useSelectedCompanyStore();

  const { data, isLoading } = useGetCompaniesQuery();

  function handleCompanyChange(value: string) {
    const company = data?.find((company) => company.id === value);

    if (company) {
      setSelectedCompany(company);

      return;
    }

    setSelectedCompany(null);
  }

  return (
    <Select onValueChange={handleCompanyChange} value={selectedCompany?.id || ''}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Empresa" />
      </SelectTrigger>

      <SelectContent>
        {isLoading ? (
          <p className="text-muted-foreground p-2 text-center text-sm">Carregando empresas...</p>
        ) : data && data.length > 0 ? (
          data.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.fantasy_name}
            </SelectItem>
          ))
        ) : (
          <p className="text-muted-foreground p-2 text-center text-sm">
            Nenhuma empresa encontrada
          </p>
        )}
      </SelectContent>
    </Select>
  );
}
