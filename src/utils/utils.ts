export function getTitle(prefix = ""): string {
  const base = "OPML 2 Activity Pub (AP)"
  if (prefix) {
    return `${prefix} | ${base}`
  }
  return base
}

export function getCanonical(path: string): string {
  return `https://podcastap.com/${path}`
}

export function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key)
  if (value === undefined) {
    throw new Error(`"${key}" environment variable must be set`)
  }
  return value
}
