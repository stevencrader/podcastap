# Podcast AP

With PodcastAP, users on the Fediverse can search for and follow Podcast and Music feeds with their Mastodon or Pleroma
account

# Development

1. Install [Deno](https://deno.com/) 2.x (latest stable recommended)
2. Clone Repo
3. Copy `src/example.env` to `src/.env` and update values
4. From the repo root, run `deno task start`

# Deploy

This project targets the [new Deno Deploy](https://console.deno.com) platform (Deploy Classic sunsets July 20, 2026).

## Option A: GitHub integration (recommended)

1. Create an organization and app at [console.deno.com](https://console.deno.com)
2. Link this GitHub repository
3. Set the app directory to `src`
4. Provision a Deno KV database and assign it to the app
5. Copy environment variables into Production / Preview / Build contexts as needed

Build and runtime settings are defined in `src/deno.json` under the `deploy` key.

## Option B: GitHub Actions

The workflow in `.github/workflows/deploy.yml` builds with Deno 2 and deploys via `deno deploy`.

Required repository secrets:

- `DENO_DEPLOY_TOKEN` — access token from [console.deno.com/account/access-tokens](https://console.deno.com/account/access-tokens)
- `DENO_DEPLOY_ORG` — your Deno Deploy organization slug
- Existing build secrets: `SERVER_URL`, `BASE_API_URL`, `API_KEY`, `API_SECRET`, `USER_AGENT`
