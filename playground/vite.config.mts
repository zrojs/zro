import { defineConfig } from 'vite'
import zro from 'zro/unplugin'

export default defineConfig({
  plugins: [zro.vite({})],
})
