import { Signal, useSignal } from "@preact/signals"
import { JSX } from "preact"
import { PIResponseFeed } from "../types/podcastindex.ts"
import { saveTempFeeds } from "../utils/localStorageManager.ts"
import Loading from "./Loading.tsx"

import OPMLParser from "./OPMLParser.tsx"

function parseFile(files: FileList): Promise<PIResponseFeed[]> {
  if (files?.length === 1) {
    return OPMLParser(files[0])
  }
  return new Promise<PIResponseFeed[]>((resolve) => {
    resolve([])
  })
}

export default function FileInput(): JSX.Element {
  const loading = useSignal(false)
  const error: Signal<string> = useSignal("")

  return (
    <div>
      <div className="w-full mx-auto space-y-2">
        <p className="text-lg text-center">
          Upload an OPML file exported from Podcasting app to find feeds to follow
        </p>
        <div
          className="border-dashed border rounded-lg w-full max-w-sm mx-auto p-6 flex flex-col items-center border-slate-600 border-opacity-50">
          <label
            for="file-upload"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-sm relative cursor-pointer bg-slate-600 text-slate-200"
          >
            <span>Click to upload a OPML file</span>
            <input
              className="sr-only"
              id="file-upload"
              type="file"
              accept=".opml,.xml,text/x-opml+xml,application/xml"
              value={""}
              onClick={(_event) => {
                loading.value = false
                error.value = ""
              }}
              onCancel={(_event) => {
                loading.value = false
                error.value = "⚠ No file selected"
              }}
              onInput={(event) => {
                const { value, files } = event.target as HTMLInputElement
                if (files) {
                  loading.value = true
                  error.value = ""
                  parseFile(files)
                    .then((feeds) => {
                      loading.value = false
                      if (feeds.length > 0) {
                        saveTempFeeds(feeds)
                        globalThis.location.href = "/feeds"
                      } else {
                        error.value = `❌ No feeds found in file ${value}`
                      }
                    })
                    .catch((reason: Error) => {
                      loading.value = false
                      error.value = reason.message
                    })
                } else {
                  loading.value = false
                  error.value = "⚠ No file selected"
                }
              }}
            />
          </label>
        </div>
      </div>

      {loading.value ? <Loading /> : <></>}
      {error.value === "" ? <></> : (
        <p className="text-lg text-center mt-2">
          {error.value}
        </p>
      )}
    </div>
  )
}
