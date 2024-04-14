import { Signal, useSignal } from "@preact/signals"
import { useEffect } from "preact/hooks"
import { Select } from "../components/Select.tsx"
import { getTheme, setTheme } from "../utils/localStorageManager.ts"
import { ThemeOption } from "../utils/theme.ts"
import MoonIcon from "./icons/MoonIcon.tsx"
import SunIcon from "./icons/SunIcon.tsx"

interface DarkModeControlProps {
  selector?: boolean
  className?: string
}

export default function DarkModeControl(props: DarkModeControlProps) {
  const { className } = props
  const selector = props.selector === true
  const theme: Signal<string> = useSignal(getTheme())
  const isAuto: Signal<boolean> = useSignal(getTheme() === "auto")

  function setThemeClass(dark: boolean) {
    if (dark) {
      theme.value = "dark"
      document.documentElement.classList.add("dark")
    } else {
      theme.value = "light"
      document.documentElement.classList.remove("dark")
    }
    if (!isAuto.value) {
      setTheme(theme.value)
    }
  }

  useEffect(() => {
    globalThis.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
      if (isAuto.value) {
        setThemeClass(!e.matches)
      }
    })


    if (theme.value === "auto") {
      const matches = globalThis.matchMedia("(prefers-color-scheme: light)").matches
      theme.value = matches ? "light" : "dark"
    }

    setThemeClass(theme.value === "dark")
  }, [])

  if (selector) {
    return (
      <Select
        name="theme"
        id="theme"
        onChange={(e) => {
          const newValue = (e.target as HTMLSelectElement).value
          if (newValue === "auto") {
            isAuto.value = true
            setTheme("auto")
          } else {
            isAuto.value = false
            setThemeClass(newValue === "dark")
          }
        }}
        className={className}
      >
        {ThemeOption.map((option) => {
          let selected = false
          if (isAuto.value) {
            selected = option === "auto"
          } else {
            selected = option === theme.value
          }
          return (
            <option
              value={option}
              selected={selected}
            >
              {`${option[0].toUpperCase()}${option.substring(1)}`}
            </option>
          )
        })}
      </Select>
    )
  }

  return (
    <div
      className={`cursor-pointer p-1 block fixed bottom-3 right-3 rounded-full bg-slate-600 text-pink-400 z-50 ${className}`}
      onClick={(e) => {
        isAuto.value = false
        setThemeClass(theme.value !== "dark")
      }}
    >
      {theme.value === "dark" ? <SunIcon /> : <MoonIcon />}
    </div>
  )
}
