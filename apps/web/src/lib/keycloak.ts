import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || '',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || '',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || '',
};

export const keycloak = new Keycloak(keycloakConfig);

let initPromise: Promise<boolean> | null = null;

export async function initKeycloak(): Promise<boolean> {
  // Prevent double initialization in React StrictMode
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const authenticated = await keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: 'S256',
      });

      if (authenticated) {
        // Setup token refresh
        setInterval(() => {
          keycloak.updateToken(70).catch(() => {
            keycloak.logout();
          });
        }, 60000);
      }

      return authenticated;
    } catch (error) {
      console.error('Keycloak init error:', error);
      initPromise = null;
      return false;
    }
  })();

  return initPromise;
}

export function login(): void {
  keycloak.login();
}

export function logout(): void {
  keycloak.logout();
}

export function getToken(): string | undefined {
  return keycloak.token;
}

export function isAuthenticated(): boolean {
  return !!keycloak.authenticated;
}
