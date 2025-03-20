import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import zro from 'zro/unplugin/vite'

export default defineConfig({
  plugins: [tsconfigPaths(), tailwindcss(), zro()],
})
