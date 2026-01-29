import { PageContainer } from '@/components/layout';
import { ConstructionCompaniesTable } from '@/components/tables/ConstructionCompaniesTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth';
import { Permissions, hasPermission } from '@portal/shared';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ConstructionCompaniesListPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const canCreate = hasPermission(user?.permission ?? null, Permissions.COMPANIES_CREATE);

  return (
    <PageContainer className="space-y-4 lg:space-y-6 xl:space-y-8 min-w-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 truncate">
            Firmas Instaladoras
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-slate-600 truncate">
            Gestión de empresas constructoras
          </p>
        </div>
        {canCreate && (
          <Button asChild className="xl:h-11 xl:px-6 xl:text-base flex-shrink-0">
            <Link to="/construction-companies/new">
              <Plus className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
              Nueva Firma
            </Link>
          </Button>
        )}
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base lg:text-lg xl:text-xl">
              Lista de Firmas Instaladoras
            </CardTitle>
            <Input
              placeholder="Buscar por nombre o NIT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56 lg:w-64 xl:w-80 xl:h-10"
            />
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <ConstructionCompaniesTable search={search} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
