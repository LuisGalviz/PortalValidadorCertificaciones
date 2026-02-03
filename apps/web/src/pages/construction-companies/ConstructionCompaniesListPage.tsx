import { PageContainer, usePageHeader } from '@/components/layout';
import { ConstructionCompaniesTable } from '@/components/tables/ConstructionCompaniesTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth';
import { Permissions, hasPermission } from '@portal/shared';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ConstructionCompaniesListPage() {
  usePageHeader({
    title: 'Firmas Instaladoras',
    subtitle: 'Gestión de empresas constructoras',
  });

  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const canCreate = hasPermission(user?.permission ?? null, Permissions.COMPANIES_CREATE);

  return (
    <PageContainer className="min-w-0" fullHeight={true}>
      <div className="min-w-0 flex flex-col flex-1 min-h-0 space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-base lg:text-lg xl:text-xl font-semibold text-slate-900">
            Lista de Firmas Instaladoras
          </h2>
          <div className="flex items-center gap-3 xl:gap-4 flex-wrap w-full sm:w-auto">
            <Input
              placeholder="Buscar por nombre o NIT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56 lg:w-64 xl:w-80 xl:h-10"
            />
            {canCreate && (
              <Button asChild className="w-full sm:w-auto xl:h-10 xl:px-4">
                <Link to="/construction-companies/new">
                  <Plus className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
                  Nueva Firma
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 min-h-0">
          <ConstructionCompaniesTable search={search} />
        </div>
      </div>
    </PageContainer>
  );
}
