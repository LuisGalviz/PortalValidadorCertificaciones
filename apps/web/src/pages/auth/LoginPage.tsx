import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md xl:max-w-lg 2xl:max-w-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl lg:text-2xl xl:text-3xl">
            Portal Validador de Certificaciones
          </CardTitle>
          <CardDescription className="xl:text-base">Inicie sesión para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={login} className="w-full xl:h-12 xl:text-lg" size="lg">
            Iniciar Sesión con Keycloak
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
