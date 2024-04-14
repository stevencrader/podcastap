import { LookupResult } from "../utils/ap_lookup.ts"
import { Account } from "./MastodonAPI.ts"

export interface StateData {
  servers: string[]
  signedIn: boolean
  activeServer?: string
  user?: Account
  searchResults?: LookupResult[]
}
