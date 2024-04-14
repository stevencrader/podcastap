import { JSX } from "preact"

type SizeValues = "large" | "medium" | "small" | "x-small"

const sizes = [
  "x-small",
  "small",
  "medium",
  "large"
]

interface LoadingProps {
  size?: SizeValues
  className?: string
}

/**
 * Display the loading indicator
 * @returns the indicator html
 */
export default function Loading(props: LoadingProps): JSX.Element {
  let { size, className } = props
  let smallSize = "small"
  if (size === undefined) {
    size = "medium"
  } else if (!sizes.includes(size.toLowerCase())) {
    size = "medium"
  }

  const index = sizes.indexOf(size)
  if (index > 0) {
    smallSize = sizes[index - 1]
  }

  const animation_delays = [
    "animation-delay-0",
    "animation-delay-400",
    "animation-delay-800",
    "animation-delay-400",
    "animation-delay-8000",
    "animation-delay-1200",
    "animation-delay-800",
    "animation-delay-1200",
    "animation-delay-1600"
  ]

  return (
    // Animation from https://loading.io/css/
    <div className={`relative mx-auto block loading-${smallSize} md:loading-${size} ${className}`}>
      {animation_delays.map((delay) => {
        return <div className={`segment ${delay} bg-slate-600 absolute animate-pulse rounded-full`}></div>
      })}
    </div>
  )
}
