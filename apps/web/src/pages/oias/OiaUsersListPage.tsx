import { PageContainer } from '@/components/layout';
import { OiaUsersTable } from '@/components/tables';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { showError } from '@/lib/toast';
import type { ApiResponse, Oia } from '@portal/shared';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

async function fetchOiaName(id: string): Promise<string | null> {
  try {
    const response = await api.get<ApiResponse<Oia>>(`/oias/${id}`);
    if (response.success && response.data?.name) {
      return response.data.name;
    }
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Error al cargar OIA');
  }
  return null;
}

export function OiaUsersListPage() {
  const { id } = useParams();
  const oiaId = Number(id);
  const [oiaName, setOiaName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || Number.isNaN(oiaId)) {
      setLoading(false);
      return;
    }

    const oiaIdParam = id;
    let isMounted = true;
    async function loadOia() {
      const name = await fetchOiaName(oiaIdParam);
      if (!isMounted) return;
      if (name) setOiaName(name);
      setLoading(false);
    }

    loadOia();
    return () => {
      isMounted = false;
    };
  }, [id, oiaId]);

  if (!id || Number.isNaN(oiaId)) {
    return (
      <PageContainer>
        <div className="text-sm text-slate-600">OIA inválida.</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-4 lg:space-y-6 xl:space-y-8 min-w-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 truncate">
            Usuarios OIA
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-slate-600 truncate">
            {loading ? 'Cargando OIA...' : oiaName ? `${oiaName}` : `OIA #${id}`}
          </p>
        </div>
        <Button asChild variant="outline" className="xl:h-11 xl:px-6 xl:text-base flex-shrink-0">
          <Link to="/oias">
            <ArrowLeft className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg xl:text-xl">Listado de usuarios</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <OiaUsersTable oiaId={oiaId} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
