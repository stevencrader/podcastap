// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import { type Manifest } from "$fresh/server.ts"
import * as $DarkModeControl from "./islands/DarkModeControl.tsx"
import * as $Feed from "./islands/Feed.tsx"
import * as $Feeds from "./islands/Feeds.tsx"
import * as $FileInput from "./islands/FileInput.tsx"
import * as $FollowUnfollow from "./islands/FollowUnfollow.tsx"
import * as $icons_CrossXIcon from "./islands/icons/CrossXIcon.tsx"
import * as $icons_FediverseIcon from "./islands/icons/FediverseIcon.tsx"
import * as $icons_LinkIcon from "./islands/icons/LinkIcon.tsx"
import * as $icons_MagnifyingGlassIcon from "./islands/icons/MagnifyingGlassIcon.tsx"
import * as $icons_MoonIcon from "./islands/icons/MoonIcon.tsx"
import * as $icons_PlaylistIcon from "./islands/icons/PlaylistIcon.tsx"
import * as $icons_PodcastAPIcon from "./islands/icons/PodcastAPIcon.tsx"
import * as $icons_PodcastIndexIcon from "./islands/icons/PodcastIndexIcon.tsx"
import * as $icons_RSSIcon from "./islands/icons/RSSIcon.tsx"
import * as $icons_SunIcon from "./islands/icons/SunIcon.tsx"
import * as $icons_UploadIcon from "./islands/icons/UploadIcon.tsx"
import * as $Loading from "./islands/Loading.tsx"
import * as $LocalServerHandler from "./islands/LocalServerHandler.tsx"
import * as $OPMLParser from "./islands/OPMLParser.tsx"
import * as $OPMLWriter from "./islands/OPMLWriter.tsx"
import * as $RedirectManager from "./islands/RedirectManager.tsx"
import * as $SelectServer from "./islands/SelectServer.tsx"
import * as $Settings from "./islands/Settings.tsx"
import * as $_404 from "./routes/_404.tsx"
import * as $_500 from "./routes/_500.tsx"
import * as $_app from "./routes/_app.tsx"
import * as $_middleware from "./routes/_middleware.ts"
import * as $about from "./routes/about.tsx"
import * as $api_lookup from "./routes/api/lookup.ts"
import * as $api_mastodon_follow from "./routes/api/mastodon/follow.tsx"
import * as $api_mastodon_unfollow from "./routes/api/mastodon/unfollow.tsx"
import * as $auth_callback from "./routes/auth/callback.ts"
import * as $auth_signin from "./routes/auth/signin.ts"
import * as $auth_signout from "./routes/auth/signout.ts"
import * as $feed_id_ from "./routes/feed/[id].tsx"
import * as $feeds from "./routes/feeds.tsx"
import * as $index from "./routes/index.tsx"
import * as $legal from "./routes/legal.tsx"
import * as $search from "./routes/search.tsx"
import * as $settings from "./routes/settings.tsx"
import * as $upload from "./routes/upload.tsx"

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_500.tsx": $_500,
    "./routes/_app.tsx": $_app,
    "./routes/_middleware.ts": $_middleware,
    "./routes/about.tsx": $about,
    "./routes/api/lookup.ts": $api_lookup,
    "./routes/api/mastodon/follow.tsx": $api_mastodon_follow,
    "./routes/api/mastodon/unfollow.tsx": $api_mastodon_unfollow,
    "./routes/auth/callback.ts": $auth_callback,
    "./routes/auth/signin.ts": $auth_signin,
    "./routes/auth/signout.ts": $auth_signout,
    "./routes/feed/[id].tsx": $feed_id_,
    "./routes/feeds.tsx": $feeds,
    "./routes/index.tsx": $index,
    "./routes/legal.tsx": $legal,
    "./routes/search.tsx": $search,
    "./routes/settings.tsx": $settings,
    "./routes/upload.tsx": $upload
  },
  islands: {
    "./islands/DarkModeControl.tsx": $DarkModeControl,
    "./islands/Feed.tsx": $Feed,
    "./islands/Feeds.tsx": $Feeds,
    "./islands/FileInput.tsx": $FileInput,
    "./islands/FollowUnfollow.tsx": $FollowUnfollow,
    "./islands/Loading.tsx": $Loading,
    "./islands/LocalServerHandler.tsx": $LocalServerHandler,
    "./islands/OPMLParser.tsx": $OPMLParser,
    "./islands/OPMLWriter.tsx": $OPMLWriter,
    "./islands/RedirectManager.tsx": $RedirectManager,
    "./islands/SelectServer.tsx": $SelectServer,
    "./islands/Settings.tsx": $Settings,
    "./islands/icons/CrossXIcon.tsx": $icons_CrossXIcon,
    "./islands/icons/FediverseIcon.tsx": $icons_FediverseIcon,
    "./islands/icons/LinkIcon.tsx": $icons_LinkIcon,
    "./islands/icons/MagnifyingGlassIcon.tsx": $icons_MagnifyingGlassIcon,
    "./islands/icons/MoonIcon.tsx": $icons_MoonIcon,
    "./islands/icons/PlaylistIcon.tsx": $icons_PlaylistIcon,
    "./islands/icons/PodcastAPIcon.tsx": $icons_PodcastAPIcon,
    "./islands/icons/PodcastIndexIcon.tsx": $icons_PodcastIndexIcon,
    "./islands/icons/RSSIcon.tsx": $icons_RSSIcon,
    "./islands/icons/SunIcon.tsx": $icons_SunIcon,
    "./islands/icons/UploadIcon.tsx": $icons_UploadIcon
  },
  baseUrl: import.meta.url
} satisfies Manifest

export default manifest
