import { assertEquals, equal } from "@std/assert"
import { PIResponseFeed } from "../src/types/podcastindex.ts"
import { mergeFeeds } from "../src/utils/localStorageManager.ts"

Deno.test("merge feeds : new url", () => {
  const feeds1: PIResponseFeed[] = [
    {
      "title": "The Joe Rogan Experience",
      "url": "https://anchor.fm/s/308e8de0/podcast/rss",
      "originalUrl": "https://anchor.fm/s/308e8de0/podcast/rss",
      "fromIndex": false,
      "source": "file"
    }
  ]
  const feeds2: PIResponseFeed[] = [
    {
      "id": 6786106,
      "title": "The Joe Rogan Experience",
      "url": "https://feeds.megaphone.fm/GLT1412515089",
      "originalUrl": "https://anchor.fm/s/308e8de0/podcast/rss",
      "description": "The official podcast of comedian Joe Rogan.",
      "author": "Joe Rogan",
      "image": "https://megaphone.imgix.net/podcasts/8e5bcebc-ca16-11ee-89f0-0fa0b9bdfc7c/image/ab6765630000ba8af2068393841931950237dbe4.jpeg?ixlib=rails-4.3.1&max-w=3000&max-h=3000&fit=crop&auto=format,compress",
      "artwork": "https://megaphone.imgix.net/podcasts/8e5bcebc-ca16-11ee-89f0-0fa0b9bdfc7c/image/ab6765630000ba8af2068393841931950237dbe4.jpeg?ixlib=rails-4.3.1&max-w=3000&max-h=3000&fit=crop&auto=format,compress",
      "fromIndex": true,
      "source": "file"
    }
  ]
  const expected: PIResponseFeed[] = [
    {
      "id": 6786106,
      "title": "The Joe Rogan Experience",
      "url": "https://feeds.megaphone.fm/GLT1412515089",
      "originalUrl": "https://anchor.fm/s/308e8de0/podcast/rss",
      "description": "The official podcast of comedian Joe Rogan.",
      "author": "Joe Rogan",
      "image": "https://megaphone.imgix.net/podcasts/8e5bcebc-ca16-11ee-89f0-0fa0b9bdfc7c/image/ab6765630000ba8af2068393841931950237dbe4.jpeg?ixlib=rails-4.3.1&max-w=3000&max-h=3000&fit=crop&auto=format,compress",
      "artwork": "https://megaphone.imgix.net/podcasts/8e5bcebc-ca16-11ee-89f0-0fa0b9bdfc7c/image/ab6765630000ba8af2068393841931950237dbe4.jpeg?ixlib=rails-4.3.1&max-w=3000&max-h=3000&fit=crop&auto=format,compress",
      "fromIndex": true,
      "source": "file"
    }
  ]
  const out = mergeFeeds(feeds1, feeds2)
  assertEquals(expected.length, out.length, "Length")
  assertEquals(equal(expected, out), true, "data")
})

Deno.test("merge feeds : new feed", () => {
  const priorFeeds: PIResponseFeed[] = [
    {
      "title": "Animated No Agenda",
      "url": "https://noagendatube.com/feeds/podcast/videos.xml?videoChannelId=73",
      "originalUrl": "https://noagendatube.com/feeds/podcast/videos.xml?videoChannelId=73",
      "fromIndex": false,
      "source": "file"
    }
  ]
  const newFeeds: PIResponseFeed[] = [
    {
      "title": "The Belligerent Beavs Podcast",
      "url": "https://anchor.fm/s/581c3704/podcast/rss",
      "originalUrl": "https://anchor.fm/s/581c3704/podcast/rss",
      "fromIndex": false,
      "source": "file"
    }
  ]
  const expected: PIResponseFeed[] = [
    {
      "title": "Animated No Agenda",
      "url": "https://noagendatube.com/feeds/podcast/videos.xml?videoChannelId=73",
      "originalUrl": "https://noagendatube.com/feeds/podcast/videos.xml?videoChannelId=73",
      "fromIndex": false,
      "source": "file"
    },
    {
      "title": "The Belligerent Beavs Podcast",
      "url": "https://anchor.fm/s/581c3704/podcast/rss",
      "originalUrl": "https://anchor.fm/s/581c3704/podcast/rss",
      "fromIndex": false,
      "source": "file"
    }
  ]
  const out = mergeFeeds(priorFeeds, newFeeds)
  // console.log("expected", expected)
  // console.log("out", out)
  assertEquals(expected.length, out.length, "Length")
  assertEquals(equal(expected, out), true, "data")
})

Deno.test("merge feeds : same name", () => {
  const priorFeeds: PIResponseFeed[] = [
    {
      "title": "The Way I Heard It with Mike Rowe",
      "url": "https://feeds.libsyn.com/74011/rss",
      "originalUrl": "https://feeds.libsyn.com/74011/rss",
      "fromIndex": false,
      "source": "file"
    }
  ]
  const newFeeds: PIResponseFeed[] = [
    {
      "title": "The Way I Heard It with Mike Rowe",
      "url": "https://audioboom.com/channels/5060313.rss",
      "originalUrl": "https://audioboom.com/channels/5060313.rss",
      "fromIndex": false,
      "source": "file"
    }
  ]
  const expected: PIResponseFeed[] = [
    {
      "title": "The Way I Heard It with Mike Rowe",
      "url": "https://feeds.libsyn.com/74011/rss",
      "originalUrl": "https://feeds.libsyn.com/74011/rss",
      "fromIndex": false,
      "source": "file"
    },
    {
      "title": "The Way I Heard It with Mike Rowe",
      "url": "https://audioboom.com/channels/5060313.rss",
      "originalUrl": "https://audioboom.com/channels/5060313.rss",
      "fromIndex": false,
      "source": "file"
    }
  ]
  const out = mergeFeeds(priorFeeds, newFeeds)
  // console.log("expected", expected)
  // console.log("out", out)
  assertEquals(expected.length, out.length, "Length")
  assertEquals(equal(expected, out), true, "data")
})

Deno.test("merge feeds : offline", async () => {
  const decoder = new TextDecoder("utf-8")
  const priorFeeds: PIResponseFeed[] = JSON.parse(decoder.decode(await Deno.readFile("test_files/prior.json")))
  const newFeeds: PIResponseFeed[] = JSON.parse(decoder.decode(await Deno.readFile("test_files/new.json")))
  const expected: PIResponseFeed[] = JSON.parse(decoder.decode(await Deno.readFile("test_files/combined.json")))
  const out = mergeFeeds(priorFeeds, newFeeds)
  const encoder = new TextEncoder()
  // await Deno.mkdir("test_output")
  await Deno.writeFile("test_output/expected.json", encoder.encode(JSON.stringify(expected, null, 2)))
  await Deno.writeFile("test_output/actual.json", encoder.encode(JSON.stringify(out, null, 2)))
  assertEquals(expected.length, out.length, "Length")
  assertEquals(equal(expected, out), true, "data")
})
