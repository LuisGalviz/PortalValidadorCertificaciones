import { ConstructionCompaniesTable } from '@/components/tables/ConstructionCompaniesTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth';
import { Profile } from '@portal/shared';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ConstructionCompaniesListPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const canCreate = user?.permission === Profile.Admin;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Firmas Instaladoras</h1>
          <p className="text-slate-600">Gestión de empresas constructoras</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link to="/construction-companies/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Firma
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Firmas Instaladoras</CardTitle>
            <Input
              placeholder="Buscar por nombre o NIT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ConstructionCompaniesTable search={search} />
        </CardContent>
      </Card>
    </div>
  );
}
