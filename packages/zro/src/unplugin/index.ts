import { joinURL } from 'ufo'
import { unctxPlugin } from 'unctx/plugin'
import { createUnplugin, UnpluginOptions } from 'unplugin'
import { prepare } from './generators'

type ZroUnpluginOptions = {}
export default createUnplugin<ZroUnpluginOptions>((options, meta) => {
  const routesDir = process.cwd() + '/routes'
  return [
    {
      name: 'zro-vite-plugin',
      async buildStart() {
        await prepare({ routesDir })
      },
      async watchChange(id, change) {
        if (!id.startsWith(joinURL(process.cwd(), '.zro'))) await prepare({ routesDir })
      },
      vite: {
        config(config, env) {
          return {
            ...config,
            logLevel: 'warn',
            optimizeDeps: {
              include: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client'],
            },
            esbuild: {
              jsx: 'automatic',
            },
            ssr: {
              external: ['zro'],
            },
          }
        },
      },
    },
    unctxPlugin.raw({}, meta) as UnpluginOptions,
  ]
})
