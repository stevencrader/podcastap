import { assertEquals } from "@std/assert"
import { Emoji } from "../src/types/MastodonAPI.ts"
import parseEmoji from "../src/utils/parseEmoji.tsx"

const EMOJI_PCI: Emoji = {
  shortcode: "pci",
  url: "https://cdn.masto.host/podcastindexsocial/custom_emojis/images/000/037/095/original/265883cc37d278d4.png",
  static_url: "https://cdn.masto.host/podcastindexsocial/custom_emojis/images/000/037/095/static/265883cc37d278d4.png",
  visible_in_picker: true
}

const EMOJI_PODCASTING2: Emoji = {
  shortcode: "podcasting2",
  static_url: "https://cdn.masto.host/podcastindexsocial/cache/custom_emojis/images/000/037/553/static/c2885be49e30b17c.png",
  url: "https://cdn.masto.host/podcastindexsocial/cache/custom_emojis/images/000/037/553/original/c2885be49e30b17c.png",
  visible_in_picker: true
}

const EMOJI: Emoji[] = [
  EMOJI_PCI,
  EMOJI_PODCASTING2
]

const USERNAME = <span>Steven Crader</span>
const EMOJI_PCI_IMG = <img src={EMOJI_PCI.static_url} alt={`Emoji for shortcode ${EMOJI_PCI.shortcode}`} class="h-5" />
const EMOJI_PODCASTING2_IMG = <img src={EMOJI_PODCASTING2.static_url}
                                   alt={`Emoji for shortcode ${EMOJI_PODCASTING2.shortcode}`} class="h-5" />

Deno.test("no emoji", () => {
  const expected = [USERNAME]
  const out = parseEmoji("Steven Crader", EMOJI)
  assertEquals(expected, out)
})

Deno.test("emoji trailing", () => {
  const expected = [USERNAME, EMOJI_PCI_IMG]
  const out = parseEmoji("Steven Crader :pci:", EMOJI)
  assertEquals(expected, out)
})

Deno.test("emoji multiple", () => {
  const expected = [USERNAME, EMOJI_PCI_IMG, EMOJI_PODCASTING2_IMG]
  const out = parseEmoji("Steven Crader :pci: :podcasting2:", EMOJI)
  assertEquals(expected, out)
})

Deno.test("emoji leading", () => {
  const expected = [EMOJI_PCI_IMG, USERNAME]
  const out = parseEmoji(":pci: Steven Crader", EMOJI)
  assertEquals(expected, out)
})

Deno.test("emoji middle", () => {
  const expected = [<span>Steven</span>, EMOJI_PCI_IMG, <span>Crader</span>]
  const out = parseEmoji("Steven :pci: Crader", EMOJI)
  assertEquals(expected, out)
})

Deno.test("emoji both", () => {
  const expected = [EMOJI_PCI_IMG, USERNAME, EMOJI_PCI_IMG]
  const out = parseEmoji(":pci: Steven Crader :pci:", EMOJI)
  assertEquals(expected, out)
})

Deno.test("emoji unknown", () => {
  const expected = [USERNAME, <span>:verified:</span>, EMOJI_PCI_IMG]
  const out = parseEmoji("Steven Crader :verified: :pci:", EMOJI)
  assertEquals(expected, out)
})
