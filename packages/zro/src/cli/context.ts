import { AsyncLocalStorage } from 'node:async_hooks'
import { createContext } from 'unctx'

export const zroContext = createContext<{ title: string; version: string }>({
  asyncContext: true,
  AsyncLocalStorage,
})

export const useZro = zroContext.use
