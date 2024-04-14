import { getURL } from "../utils/url.ts"

const kv = await Deno.openKv()

export interface DBServer {
  url: string
  serverType?: string // mastodon | pleroma
  clientId?: string
  clientSecret?: string
  created: number
  updated: number
}

const MAX_ATTEMPTS = 5
const ROOT = "podcastap"

const AP_SERVER_KEY_BASE: Deno.KvKeyPart[] = [ROOT, "server"]

async function updateDB<T>(
  key: Deno.KvKeyPart[],
  makeValue: (current: T | null) => T,
  returnIfExists = false
): Promise<boolean> {
  // Retry the transaction until it succeeds.
  let res: Deno.KvCommitResult | Deno.KvCommitError = { ok: false }
  let attempt = 0
  while (!res.ok && attempt++ < MAX_ATTEMPTS) {
    const entry = await kv.get<T>(key)
    const current = entry.value
    // don't continue if already exists
    if (returnIfExists && current !== null) {
      return true
    }

    const value: T = makeValue(current)

    res = await kv.atomic()
      .check(entry)
      .set(key, value)
      .commit()
  }
  return res.ok
}

// async function deleteDB<T>(
//   key: Deno.KvKeyPart[]
// ): Promise<boolean> {
//   // Retry the transaction until it succeeds.
//   let res: Deno.KvCommitResult | Deno.KvCommitError = { ok: false }
//   let attempt = 0
//   while (!res.ok && attempt++ < MAX_ATTEMPTS) {
//     const entry = await kv.get<T>(key)
//     const current = entry.value
//     if (current === null) {
//       return true
//     }
//
//     res = await kv.atomic()
//       .check(entry)
//       .delete(key)
//       .commit()
//   }
//   return res.ok
// }

// region Server

function getServerKey(url: URL): Deno.KvKeyPart[] {
  return [...AP_SERVER_KEY_BASE, url.hostname]
}

function getServerKeyAndURL(url: string): {
  key?: Deno.KvKeyPart[]
  serverUrl?: URL
} {
  const serverUrl = getURL(url)
  if (serverUrl === null) {
    return {}
  }

  const key = getServerKey(serverUrl)
  return {
    key,
    serverUrl
  }
}

// async function initServer(url: string): Promise<boolean> {
//   const { key, serverUrl } = getServerKeyAndURL(url)
//   if (key === undefined || serverUrl === undefined) {
//     return false
//   }
//
//   return await updateDB<DBServer>(
//     key,
//     (): DBServer => {
//       return {
//         url: serverUrl.origin,
//         created: Date.now(),
//         updated: Date.now()
//       }
//     },
//     true
//   )
// }

export async function addServerInfo(serverData: DBServer): Promise<boolean> {
  const { key, serverUrl } = getServerKeyAndURL(serverData.url)
  if (key === undefined || serverUrl === undefined) {
    return false
  }

  return await updateDB<DBServer>(
    key,
    (current): DBServer => {
      if (current === null) {
        return {
          ...serverData,
          url: serverUrl.origin,
          created: Date.now(),
          updated: Date.now()
        }
      }
      return {
        ...current,
        ...serverData,
        created: current.created || Date.now(),
        updated: Date.now()
      }
    },
    false
  )
}

export async function getServer(url: string): Promise<DBServer | null> {
  const { key, serverUrl } = getServerKeyAndURL(url)
  if (key === undefined || serverUrl === undefined) {
    return null
  }

  const entry = await kv.get<DBServer>(key)
  const value = entry.value
  if (value === null) {
    return {
      url: serverUrl.origin,
      created: Date.now(),
      updated: Date.now()
    }
  }
  return value
}

async function getServers(): Promise<DBServer[]> {
  const entries = kv.list<DBServer>({ prefix: AP_SERVER_KEY_BASE })
  const servers: DBServer[] = []
  for await (const entry of entries) {
    servers.push(entry.value)
  }
  return servers
}

export async function getServerUrls(): Promise<string[]> {
  const servers = await getServers()
  const validServers = servers.filter((server) => AP_SERVERS_PUBLIC.includes(server.url))
  return validServers.map((server) => server.url)
}

// async function deleteServer(url: string): Promise<boolean> {
//   const { key, serverUrl } = getServerKeyAndURL(url)
//   if (key === undefined || serverUrl === undefined) {
//     return false
//   }
//
//   return await deleteDB(key)
// }

// endregion Server

const AP_SERVERS_PUBLIC = [
  "https://podcastindex.social",
  "https://mastodon.social",
  "https://noauthority.social"
]

export async function initDB() {
  // for (const server of (await getServers())) {
  //   await deleteServer(server.url)
  // }

  // only needed when adding new default servers
  // await Promise.all<boolean>(AP_SERVERS_PUBLIC.map((server) => {
  //   return initServer(server)
  // }))

  // console.log("servers in db", await getServers())
}
