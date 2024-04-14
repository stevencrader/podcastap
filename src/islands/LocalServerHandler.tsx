import { useEffect } from "preact/hooks"
import { StateData } from "../types/StateData.ts"
import { getTempServerUrl, setTempServerUrl, updateServerUrls } from "../utils/localStorageManager.ts"

interface LocalServerHandlerProps {
  stateData?: StateData
  error?: Error
}

export default function LocalServerHandler(props: LocalServerHandlerProps) {
  const { error, stateData } = props
  let signedIn = false
  let activeServer = ""
  if (stateData) {
    signedIn = stateData.signedIn
    activeServer = stateData.activeServer || ""
  }

  useEffect(() => {
    const tempServerUrl = getTempServerUrl()

    if (tempServerUrl !== "" && error === undefined && signedIn && activeServer) {
      updateServerUrls([tempServerUrl])
    }
    setTempServerUrl()
  }, [])

  return <></>
}
