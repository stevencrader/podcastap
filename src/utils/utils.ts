export function getTitle(prefix = ""): string {
  const base = "Podcast AP"
  if (prefix) {
    return `${prefix} | ${base}`
  }
  return base
}

export function getCanonical(path: string): string {
  const urlBase = 'https://podcastap.com'
  if (path === "") {
    return urlBase
  }
  return `${urlBase}/${path}`
}

export function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key)
  if (value === undefined) {
    throw new Error(`"${key}" environment variable must be set`)
  }
  return value
}
