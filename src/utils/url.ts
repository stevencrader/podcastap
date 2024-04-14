export function getURL(value: string): URL | null {
  try {
    let valueClean = value.trim()
    if (!valueClean.startsWith("http")) {
      valueClean = `https://${valueClean}`
    }
    const url = new URL(valueClean)
    if (url.protocol === "http:") {
      url.protocol = "https:"
    }
    return url
  } catch (e) {
    console.error(`Unable to get url from ${value}`, e)
    return null
  }
}

export function removeTrailingSlash(value: string): string {
  if (value.endsWith("/")) {
    value = value.substring(0, value.length - 1)
  }
  return value
}
