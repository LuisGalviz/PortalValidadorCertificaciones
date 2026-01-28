import session from 'express-session';
import Keycloak from 'keycloak-connect';

const memoryStore = new session.MemoryStore();

const { KEYCLOAK_REALM, KEYCLOAK_AUTH_URL, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET } =
  process.env;

const keycloakConfig = {
  realm: KEYCLOAK_REALM || '',
  'auth-server-url': KEYCLOAK_AUTH_URL || '',
  'ssl-required': 'external',
  resource: KEYCLOAK_CLIENT_ID || '',
  'confidential-port': 0,
  'bearer-only': true,
  credentials: {
    secret: KEYCLOAK_CLIENT_SECRET || '',
  },
};

export const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
export { memoryStore };
