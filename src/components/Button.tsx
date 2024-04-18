import { ComponentChildren, JSX } from "preact"

interface ButtonProps {
  title?: string
  onClick?: (event: Event) => void
  disabled?: boolean
  children?: ComponentChildren
  className?: string
}

export function Button(props: ButtonProps): JSX.Element {
  const { title, onClick, disabled, children, className } = props

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 md:h-10 px-2 py-0 md:px-4 md:py-2 text-sm relative bg-slate-600 text-slate-200 border-0 hover:bg-slate-700   ${className}`}
      title={title}
      onClick={onClick}
      disabled={disabled}
    >
      {children ? children : ""}
    </button>
  )
}
