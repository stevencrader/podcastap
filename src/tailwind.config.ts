import { type Config } from "tailwindcss"
import animationDelay from "tailwindcss-animation-delay"
import tailwindcss_aria_attributes from "tailwindcss-aria-attributes"

export default {
  darkMode: "selector",
  content: ["{routes,islands,components}/**/*.{ts,tsx}"],
  plugins: [animationDelay, tailwindcss_aria_attributes.default]
} satisfies Config
