import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { keycloak, initKeycloak, login, logout as keycloakLogout, getToken } from '@/lib/keycloak';
import { api } from '@/lib/api';
import type { AuthUser } from '@portal/shared';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const authenticated = await initKeycloak();

        if (authenticated && getToken()) {
          // Fetch user info from API
          try {
            const response = await api.get<{ success: boolean; data: AuthUser }>('/auth/me');
            if (response.success) {
              setUser(response.data);
            }
          } catch (apiError) {
            console.error('Failed to fetch user info:', apiError);
            // User is authenticated in Keycloak but not in backend, use token info
            const tokenContent = keycloak.tokenParsed as { email?: string; name?: string; preferred_username?: string };
            if (tokenContent) {
              setUser({
                id: 0,
                name: tokenContent.name || tokenContent.preferred_username || 'Usuario',
                email: tokenContent.email || '',
                permission: null,
                oiaId: null,
              });
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Listen for token refresh events
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(70).catch(() => {
        setUser(null);
      });
    };
  }, []);

  const handleLogout = () => {
    setUser(null);
    keycloakLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
