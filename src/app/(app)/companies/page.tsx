import AddCompanyDialog from '@/components/companies/add-company-dialog';
import CompaniesList from '@/components/companies/companies-list';

export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">
            Gerencie as empresas clientes cadastradas no sistema
          </p>
        </div>
        <AddCompanyDialog />
      </div>
      <CompaniesList />
    </div>
  );
}
