import { JSX } from "preact"
import MagnifyingGlassIcon from "../islands/icons/MagnifyingGlassIcon.tsx"
import { Button } from "./Button.tsx"
import { Select } from "./Select.tsx"

interface SearchFormProps extends JSX.HTMLAttributes<HTMLFormElement> {
  searchValue: string
  searchType: string
}

export function SearchForm(props: SearchFormProps): JSX.Element {
  const { searchValue, searchType } = props

  return (
    <form
      className="flex items-center gap-2 mx-auto flex-col md:flex-row"
      method="get"
      action="/search"
    >
      <MagnifyingGlassIcon className="hidden md:block" />
      <input
        name="q"
        id="search"
        type="search"
        autoComplete="off"
        autoFocus
        value={searchValue}
        placeholder="Search for a podcast or music feed"
        class="h-8 md:h-10 bg-zinc-100 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-90  appearance-none border border-zinc-200 rounded-md transition-colors hover:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-slate-600 w-72 md:w-96 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
      />
      <div className="flex flex-row items-center gap-2">
        <Select
          name="type"
          id="type"
          value={searchType}
        >
          <option value="all">All</option>
          <option value="music">Music</option>
          <option value="title">Title</option>
        </Select>
        <Button>Search</Button>
      </div>
    </form>
  )
}
