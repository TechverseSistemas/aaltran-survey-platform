'use client';
import EditCompanyDialog from '@/components/companies/edit-company-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCompaniesQuery } from '@/hooks/use-companies';
import { Building2, Mail, Phone } from 'lucide-react';
import DeleteAlert from './delete-alert';

export default function CompaniesList() {
  const { data } = useGetCompaniesQuery();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((company) => (
        <Card key={company.id} className="transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">{company.fantasy_name}</CardTitle>
              </div>
            </div>
            <CardDescription>CNPJ: {company.cnpj}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Ponto Focal: {company.focal_point.name}</p>
              <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                <Mail className="h-3 w-3" />
                <span>{company.focal_point.email}</span>
              </div>
              <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                <Phone className="h-3 w-3" />
                <span>{company.focal_point.phone}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <EditCompanyDialog company={company} />
              <DeleteAlert company={company} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
