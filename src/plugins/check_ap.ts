const NODE_INFO_REL = "http://nodeinfo.diaspora.software/ns/schema/2.0"

const SUPPORTED_NODES = [
  "mastodon",
  "pleroma"
]

interface NodeInfo {
  links?: {
    rel: string
    href: string
  }[]
}

// This is only the fields needed. There may be more
interface NodeInfoDetails {
  version: string
  software: {
    name: string
    version: string
  }
  protocols: string[]
  metadata?: {
    features?: string[]
  }
}

async function getNodeInfo(url: string): Promise<string | null> {
  const nodeInfoURL = new URL("/.well-known/nodeinfo", url)

  const response = await fetch(nodeInfoURL, {
    "headers": {
      "Accept": "application/json"
    }
  })

  if (response.ok) {
    const data = await response.json() as NodeInfo
    if (data.links === undefined) {
      return null
    }
    const nodeInfoDetails = data.links.find((link) => link.rel === NODE_INFO_REL)
    if (nodeInfoDetails) {
      const href = nodeInfoDetails.href
      if (href === undefined || href === "") {
        return null
      }
      return href
    }
    return null
  }
  return null
}

async function getNodeName(url: string): Promise<string | null> {
  const response = await fetch(url, {
    "headers": {
      "Accept": "application/json"
    }
  })

  if (response.ok) {
    const data = await response.json() as NodeInfoDetails
    const software = data.software
    if (software === undefined) {
      return null
    }
    const name = software.name
    if (name === undefined || name === "") {
      return null
    }
    return name
  }
  return null
}

export type APServer = {
  valid: boolean
  name: string
}

export default async function checkIfAP(url: string): Promise<APServer> {
  const nodeInfoDetailsURL = await getNodeInfo(url)
  if (nodeInfoDetailsURL === null || nodeInfoDetailsURL === "") {
    return { valid: false, name: "" }
  }
  const name = await getNodeName(nodeInfoDetailsURL)
  if (name === null || name === "") {
    return { valid: false, name: "" }
  }
  const valid = SUPPORTED_NODES.includes(name)
  return { valid, name }
}
