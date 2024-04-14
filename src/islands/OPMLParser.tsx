import { Node, Parser, unescapeEntity } from "$xmlparser/mod.ts"
import { PIResponseFeed } from "../types/podcastindex.ts"

const OPML_FILE_TYPES: string[] = [
  "text/x-opml+xml",
  "application/xml",
  "text/xml"
]

type OPMLAttributes = {
  title?: string
  text?: string
  xmlUrl?: string
  feedGuid?: string
}

function getFeeds(node: Node): PIResponseFeed[] {
  const feeds: PIResponseFeed[] = []

  node.children.forEach((childNode: Node) => {
    const attributes = childNode.attr as OPMLAttributes
    const { title, text, xmlUrl, feedGuid } = attributes
    const useTitle = text || title

    if (xmlUrl && useTitle) {
      const feed: PIResponseFeed = {
        title: unescapeEntity(useTitle || ""),
        url: unescapeEntity(xmlUrl || ""),
        originalUrl: unescapeEntity(xmlUrl || ""),
        fromIndex: false,
        source: "file"
      }
      if (feedGuid !== undefined) {
        feed.guid = unescapeEntity(feedGuid)
      }
      feeds.push(feed)
    }
    feeds.push(...getFeeds(childNode))
  })

  return feeds
}

function fileLoaded(event: ProgressEvent): PIResponseFeed[] {
  const target = event.target as FileReader

  const parser = new Parser({})
  let root: Node
  try {
    root = parser.parse(target.result as string)
  } catch (e) {
    throw new Error(`Unable to parse file ${e}`)
  }
  const firstChild = root.getChild("opml")
  if (firstChild) {
    return getFeeds(root)
  }
  throw new Error(`File is not an OPML type`)
}

function validFileType(file: File): boolean {
  return OPML_FILE_TYPES.includes(file.type)
}

export default function OPMLParser(file: File): Promise<PIResponseFeed[]> {
  return new Promise<PIResponseFeed[]>((resolve, reject) => {
    if (validFileType(file)) {
      const reader = new FileReader()
      reader.onloadend = (event): void => {
        try {
          const feeds = fileLoaded(event)
          resolve(feeds)
        } catch (e) {
          reject(new Error(`Error parsing file: ${e}`))
        }
      }
      reader.readAsText(file)
    } else {
      reject(new Error(`The file ${file.name} is not a valid type (${file.type})`))
    }
  })
}
