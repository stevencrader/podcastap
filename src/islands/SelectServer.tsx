import { IS_BROWSER } from "$fresh/src/runtime/utils.ts"
import { Signal, useSignal } from "@preact/signals"
import { MutableRef, Ref, useEffect, useRef } from "preact/hooks"
import { Button } from "../components/Button.tsx"
import { Username } from "../components/Username.tsx"
import { Account } from "../types/MastodonAPI.ts"
import { StateData } from "../types/StateData.ts"
import { getLocalServerUrls, setTempServerUrl } from "../utils/localStorageManager.ts"
import { getURL, removeTrailingSlash } from "../utils/url.ts"
import CrossXIcon from "./icons/CrossXIcon.tsx"

const SERVER_COOKIE_NAME = "active-server"

interface SelectServerProps {
  header: boolean
  stateData?: StateData
  className?: string
}

function setCookie(name: string, val: string) {
  const date = new Date()
  const value = val

  // Set it expire in 7 days
  date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000))

  // Set it
  const cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`
  if (IS_BROWSER) {
    // console.log("Setting cookie", cookie)
    document.cookie = cookie
  }
}

export default function SelectServer(props: SelectServerProps) {
  const { header, stateData, className } = props
  const boxRef: MutableRef<HTMLDivElement | undefined> = useRef()
  const modal: MutableRef<HTMLDialogElement | undefined> = useRef()
  const visible: Signal<boolean> = useSignal(false)
  let signedIn = false
  const servers: string[] = []
  let activeServer = ""
  let user: Account | undefined = undefined
  if (stateData) {
    signedIn = stateData.signedIn
    servers.push(...(stateData.servers || []))
    activeServer = stateData.activeServer || ""
    user = stateData.user
  }
  const defaultServers = [...servers]
  const localServers = getLocalServerUrls()
  localServers.forEach((localServer) => {
    if (!servers.includes(localServer)) {
      servers.push(localServer)
    }
  })

  let errorMessage = ""
  if (IS_BROWSER) {
    const url = new URL(globalThis.location.href)
    errorMessage = url.searchParams.get("error") || ""
    if (errorMessage) {
      url.searchParams.delete("error")
      history.replaceState({}, "", url.toString())
    }

    document.addEventListener("click", function(event) {
      if (boxRef.current !== undefined) {
        const outsideClick = !boxRef.current.contains(event.target as Node)
        if (outsideClick) {
          visible.value = false
        }
      }
    })
  }

  const selectedServer: Signal<string> = useSignal(removeTrailingSlash(activeServer || ""))
  const errorShown: Signal<boolean> = useSignal(errorMessage !== "")

  useEffect(() => {
    if (modal && errorShown.value) {
      modal.current?.showModal()
    }
  }, [])

  function handleUrl(event: Event) {
    const newValue = (event.target as HTMLInputElement).value
    if (newValue) {
      const url = getURL(newValue)
      const urlHref = removeTrailingSlash(url?.href || "")
      if (url) {
        if (selectedServer.value !== url.href) {
          setCookie(SERVER_COOKIE_NAME, url.href)
          if (!defaultServers.includes(urlHref)) {
            setTempServerUrl(urlHref)
          }
        }
        selectedServer.value = urlHref
      }
    }
  }

  function SelectServerForm(props: { className?: string }) {
    return (
      <form
        className={`items-center gap-2 w-full ${props.className || ""}`}
        method="get"
        action={activeServer && signedIn ? "/auth/signout" : "/auth/signin"}
      >
        {signedIn && activeServer && user ? <Username user={user} activeServer={activeServer} /> : (
          <>
            <label
              htmlFor="ap-servers"
              className="flex flex-row gap-2 items-center text-m cursor-pointer text-slate-600 dark:text-slate-300"
            >
              <span className="hidden lg:block">Server: </span>
              <input
                className="h-8 md:h-10 bg-zinc-100 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-90  appearance-none border border-zinc-200 rounded-md transition-colors hover:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-slate-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
                id="ap-servers"
                list="ap-servers-list"
                placeholder="https://example.social"
                value={selectedServer.value}
                disabled={signedIn}
                title={signedIn ? "Please sign out before changing server" : ""}
                onChange={handleUrl}
              />
            </label>
            <datalist id="ap-servers-list">
              {servers.map((server) => {
                return <option value={server}></option>
              })}
            </datalist>
            <p
              className={`text-m ${activeServer && signedIn ? "cursor-not-allowed" : "cursor-pointer"}`}
              title="Clear"
              onClick={() => {
                if (activeServer && signedIn) {
                  return
                }
                selectedServer.value = ""
                setCookie(SERVER_COOKIE_NAME, "")
                setTempServerUrl()
              }}
            >
              <CrossXIcon />
            </p>
          </>
        )}

        <Button
          disabled={selectedServer.value === ""}
        >
          {activeServer && signedIn ? "Sign Out" : "Sign In"}
        </Button>
      </form>
    )
  }

  return (
    <div className={className}>
      <div ref={boxRef as Ref<HTMLDivElement>} className={`relative block md:hidden ${header ? "" : "hidden"}`}>
        <Button
          onClick={() => {
            if (activeServer && signedIn) {
              globalThis.location.href = "/auth/signout"
            } else {
              visible.value = !visible.value
            }
          }}
        >
          {visible.value ? "Close" : activeServer && signedIn ? "Sign Out" : "Sign In"}
        </Button>
        <div
          className={`flex flex-row justify-end gap-2 items-center absolute p-2 right-0 m-2 mr-0 bg-slate-300 dark:bg-slate-800 ${
            visible.value ? "" : "hidden"
          }`}
        >
          <SelectServerForm className="flex" />
        </div>
      </div>

      <SelectServerForm className={header ? "hidden md:flex" : "flex"} />

      <dialog ref={modal as Ref<HTMLDialogElement>} id="error_modal" className="p-4 rounded-md space-y-2 text-center">
        <h3 className="font-bold text-lg">Sign In Error</h3>
        <p>{errorMessage}</p>
        <form method="dialog">
          <Button>Close</Button>
        </form>
      </dialog>
    </div>
  )
}
