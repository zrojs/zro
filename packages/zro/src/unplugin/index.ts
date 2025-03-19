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
        await prepare({ routesDir })
      },
    },
    unctxPlugin.raw({}, meta) as UnpluginOptions,
  ]
})
