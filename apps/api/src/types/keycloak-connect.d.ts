declare module 'keycloak-connect' {
  import type { RequestHandler } from 'express';
  import type { Store } from 'express-session';

  interface KeycloakConfig {
    realm: string;
    'auth-server-url': string;
    'ssl-required': string;
    resource: string;
    'confidential-port': number;
    'bearer-only'?: boolean;
    credentials?: {
      secret: string;
    };
  }

  interface KeycloakOptions {
    store?: Store;
  }

  interface Token {
    content: Record<string, unknown>;
    isExpired(): boolean;
  }

  interface Grant {
    access_token?: Token;
    refresh_token?: Token;
    id_token?: Token;
    isExpired?(): boolean;
  }

  interface GrantManager {
    ensureFreshness(grant: Grant): Promise<Grant>;
  }

  class Keycloak {
    constructor(options: KeycloakOptions, config: KeycloakConfig);
    middleware(): RequestHandler;
    protect(spec?: string): RequestHandler;
    grantManager: GrantManager;
  }

  export = Keycloak;
  export type { Grant, Token, GrantManager, KeycloakConfig, KeycloakOptions };
}
