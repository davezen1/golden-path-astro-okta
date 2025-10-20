/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_OKTA_DOMAIN: string;
  readonly PUBLIC_OKTA_CLIENT_ID: string;
  readonly PUBLIC_OKTA_REDIRECT_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
