export interface MastodonError {
  error?: string
}

export interface Application {
  name: string
  website?: string
  client_id?: string
  client_secret?: string
}

export interface Emoji {
  shortcode: string
  static_url: string // url
  url: string // url
  visible_in_picker: boolean
}

interface Field {
  name: string
  value: string
}

export interface Account {
  id: string
  url: string
  uri: string
  acct: string
  display_name: string
  emojis: Emoji[]
  following_count: number
  fields?: Field[]
}

export interface Relationship {
  id: string
  following: boolean
  blocked_by: boolean
  blocking: boolean
  domain_blocking: boolean
  // endorsed: boolean,
  // followed_by: boolean,
  muting: boolean
  // muting_notifications: boolean,
  // note: string,
  // notifying: boolean,
  requested: boolean
  // showing_reblogs: boolean,
  // subscribing: boolean,
}
