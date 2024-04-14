import { ComponentChildren, JSX } from "preact"

interface SelectProps {
  name?: string
  id?: string
  onChange?: (event: Event) => void
  children?: ComponentChildren
  className?: string
  value?: string
}

export function Select(props: SelectProps): JSX.Element {
  const { name, id, value, onChange, children, className } = props

  return (
    <select
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-0 hover:bg-accent hover:text-accent-foreground h-8 md:h-10 px-2 py-0 md:px-4 md:py-2 text-sm relative cursor-pointer bg-slate-600 text-slate-200 ${className}`}
      name={name}
      id={id}
      onChange={onChange}
      value={value}
    >
      {children ? children : ""}
    </select>
  )
}
