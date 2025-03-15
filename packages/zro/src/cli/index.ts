import { defineCommand, runMain } from 'citty'
import { colors } from 'consola/utils'
import { useZro, zroContext } from './context'

const cli = defineCommand({
  meta: {
    name: 'zro',
  },
  subCommands: {
    dev: defineCommand({
      meta: {
        name: 'dev',
        description: 'Start the development server',
      },
      args: {
        host: {
          type: 'boolean',
          description: 'bind development server on network',
        },
      },
      run: async ({ args }) => {
        const { bootstrapDevServer } = await import('../server')
        console.clear()
        const { title, version } = useZro()
        console.log(` ${colors.bold(title)} ${colors.dim(`v${version}`)} ${colors.dim(`(Development)`)}`)
        console.log()
        const { h3 } = await bootstrapDevServer({ host: !!args.host })
      },
    }),
  },
})

zroContext.call(
  {
    title: '[Z•RO]',
    version: '0.0.1',
  },
  () => {
    runMain(cli)
  },
)
