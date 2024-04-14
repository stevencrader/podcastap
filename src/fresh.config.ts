import tailwind from "$fresh/plugins/tailwind.ts"
import { defineConfig } from "$fresh/server.ts"

export default defineConfig({
  port: 31459,
  plugins: [tailwind()]
})
