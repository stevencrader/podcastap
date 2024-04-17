import { JSX } from "preact"
import { Emoji } from "../types/MastodonAPI.ts"

const EMOJI_REGEX = /(?<emoji>:(?<short>.*?):)/g

export default function parseEmoji(display_name: string, emojis: Emoji[]): JSX.Element[] {
  const parts: JSX.Element[] = []
  let currentIndex = -1

  function buildData(result: RegExpExecArray) {
    // prior data
    if (result.index !== currentIndex + 1) {
      const name_part = display_name.substring(currentIndex, result.index)
      currentIndex = result.index + name_part.length
      parts.push(<span>{name_part.trim()}</span>)
    }

    const emojiName = result.groups?.emoji
    const emojiShort = result.groups?.short
    if (emojiName === undefined || emojiShort === undefined) {
      return
    }
    currentIndex = result.index + emojiName.length

    const emoji = emojis.find((value) => value.shortcode === emojiShort)
    if (emoji === undefined) {
      const unknown_part = display_name.substring(currentIndex, result.index)
      parts.push(<span>{unknown_part.trim()}</span>)
      return
    }
    parts.push(<img src={emoji.static_url} alt={`Emoji for shortcode ${emoji.shortcode}`} class="emoji" />)
  }

  let result: RegExpExecArray | null
  while ((result = EMOJI_REGEX.exec(display_name)) !== null) {
    buildData(result)
  }

  if (currentIndex < display_name.length) {
    parts.push(<span>{display_name.substring(currentIndex).trim()}</span>)
  }

  return parts
}
