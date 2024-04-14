import { JSX } from "preact"
import { LinkData } from "../types/LinkData.ts"

const PAGES: LinkData[] = [
  {
    title: "Legal",
    href: "/legal"
  },
  {
    title: "Settings",
    href: "/settings"
  },
  {
    title: "About",
    href: "/about"
  }
]

export default function Footer(): JSX.Element {
  return (
    <footer className="w-full">
      <div className="flex flex-col items-center gap-1 my-2 px-4 max-w-screen-2xl mx-auto">
        <nav className="flex gap-4">
          {PAGES.map((page) => {
            return (
              <a className="text-xs text-slate-600" href={`${page.href}`}>
                {page.title}
              </a>
            )
          })}
        </nav>
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} OPML 2 Activity Pub
        </p>
      </div>
    </footer>
  )
}
