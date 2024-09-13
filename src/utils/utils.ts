export function getTitle(prefix = ""): string {
  const base = "Podcast AP"
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

/**
 * Encodes text to URL safe base64
 *
 * Based on example from https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
 *
 * @param text the text to encode
 * @return the base 64 encoded text
 */
export const encodeURLSafeBase64 = (text: string): string => {
  const binString = Array.from(
    new TextEncoder().encode(text),
    (byte) => String.fromCodePoint(byte),
  ).join("");
  // since episodes.fm doesn't need trailing =, remove them
  return btoa(binString).replace(/=+$/, "");
};
