export const AP_BRIDGE = "ap.podcastindex.org"

export function getAPBridgeUsername(id?: string | number, leadingAt = true): string {
  return `${leadingAt ? "@" : ""}${id}@${AP_BRIDGE}`
}

export function getAPBridgeUserLink(server: string, id?: string | number): string {
  return `${server}${getAPBridgeUsername(id)}`
}


export function getNativeUsername(urlString: string, leadingAt = true): string {
  const url = new URL(urlString)
  const pathname = url.pathname
  let username = ""
  const peerTubeMatch = /\/c\/(?<name>\w+)/.exec(pathname)
  if (peerTubeMatch) {
    username = peerTubeMatch.groups?.name || ""
  } else if (pathname.startsWith("/@")) {
    username = pathname.substring(2)
  }
  if (username === "") {
    return ""
  }
  return `${leadingAt ? "@" : ""}${username}@${url.host}`
}

export function getNativeUserLink(server: string, urlString: string): string {
  return `${server}${getNativeUsername(urlString)}`
}
