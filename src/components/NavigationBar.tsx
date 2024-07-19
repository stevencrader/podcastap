import { JSX } from "preact"
import MagnifyingGlassIcon from "../islands/icons/MagnifyingGlassIcon.tsx"
import PlaylistIcon from "../islands/icons/PlaylistIcon.tsx"
import UploadIcon from "../islands/icons/UploadIcon.tsx"
import { LinkData } from "../types/LinkData.ts"

const PAGES: LinkData[] = [
  // {
  //   title: "Home",
  //   href: "/"
  // },
  {
    title: "Feeds",
    href: "/feeds",
    icon: <PlaylistIcon />
  },
  {
    title: "Upload",
    href: "/upload",
    icon: <UploadIcon />
  },
  {
    title: "Search",
    href: "/search",
    icon: <MagnifyingGlassIcon />
  }
]

export default function NavigationBar(): JSX.Element {
  return (
    <nav>
      <ul class="flex-row flex gap-3 items-center align-middle">
        {PAGES.map((item) => (
          <li>
            <a
              href={item.href}
              class="aria-current-page:font-bold text-slate-800 flex flex-row gap-1 items-center dark:text-slate-50 text-sm md:text-base"
            >
              <span className="hidden lg:block">{item.icon ? item.icon : ""}</span>
              <span>{item.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
