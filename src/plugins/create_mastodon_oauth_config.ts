import { type OAuth2ClientConfig } from "$deno_kv_oauth/mod.ts"

export function createMastodonOAuthConfig(
  domain: string,
  config: {
    /** @see {@linkcode OAuth2ClientConfig.clientId} */
    clientId: string
    /** @see {@linkcode OAuth2ClientConfig.clientSecret} */
    clientSecret: string
    /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
    redirectUri: string
    /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
    scope?: string | string[]
  }
): OAuth2ClientConfig {
  return {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    authorizationEndpointUri: `${domain}/oauth/authorize`,
    tokenUri: `${domain}/oauth/token`,
    redirectUri: config.redirectUri,
    defaults: { scope: config?.scope }
  }
}
