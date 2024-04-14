import PodcastAPIcon from "../islands/icons/PodcastAPIcon.tsx"
import SelectServer from "../islands/SelectServer.tsx"
import { StateData } from "../types/StateData.ts"
import NavigationBar from "./NavigationBar.tsx"

interface HeaderProps {
  stateData?: StateData
  home: boolean
}

export default function Header(props: HeaderProps) {
  const { stateData, home } = props
  return (
    <header class="bg-slate-300 w-full dark:bg-slate-800">
      <div class="flex flex-row items-center h-12 md:h-14 px-2 md:px-4 max-w-screen-2xl mx-auto">
        <a class="flex items-center font-bold mr-2 md:mr-4 text-slate-900 text-xl dark:text-slate-50 md:text-2xl"
           href="/">
          <PodcastAPIcon />
          <span>PodcastAP</span>
        </a>
        <NavigationBar />
        {home ? <></> : (
          <SelectServer header={true} stateData={stateData} className="ml-auto" />
        )}
      </div>
    </header>
  )
}
