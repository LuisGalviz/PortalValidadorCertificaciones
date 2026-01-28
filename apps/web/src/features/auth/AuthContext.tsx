import { api } from '@/lib/api';
import { getToken, initKeycloak, keycloak, logout as keycloakLogout, login } from '@/lib/keycloak';
import type { AuthUser } from '@portal/shared';
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';

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
    async function fetchUserFromApi() {
      try {
        const response = await api.get<{ success: boolean; data: AuthUser }>('/auth/me');
        if (response.success) {
          setUser(response.data);
          return true;
        }
      } catch (apiError) {
        console.error('Failed to fetch user info:', apiError);
      }
      return false;
    }

    function getUserFromToken() {
      const tokenContent = keycloak.tokenParsed as {
        email?: string;
        name?: string;
        preferred_username?: string;
      };
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

    async function init() {
      try {
        const authenticated = await initKeycloak();

        if (authenticated && getToken()) {
          const apiUserSet = await fetchUserFromApi();
          if (!apiUserSet) {
            getUserFromToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    init();

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
