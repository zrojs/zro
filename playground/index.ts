import { Middleware, Route, Router } from 'zro/router'

const router = new Router()
const rootRoute = new Route('_root', {
  loader: async () => {
    return { ok: true, analytics: new Promise(r => setTimeout(() => r(null), 2000)) }
  },
  middlewares: [
    new Middleware(async ({ next }) => {
      console.log('root middleware in')
      const n = await next({})
      console.log('root middleware out')
      return n
    }),
  ],
})

const index = new Route('/', {
  parent: rootRoute,
  loader: async () => {
    console.log('loader')
    return { heading: 'Welcome To Z۰RO', description: 'Focused on modularity' }
  },
  middlewares: [
    new Middleware(({ next }) => {
      console.log('before auth middleware')
      const _next = next({
        user: new Promise(r =>
          setTimeout(() => {
            return r({
              name: 'nariman',
            })
          }, 2000),
        ),
      })
      console.log('after auth middleware')
      return _next
    }),
  ],
}).addMiddleware(
  new Middleware(async ({ next }) => {
    console.log('x')
    return next({})
  }),
)

router.addRoute(index)

const routeData = await router.load(new Request('https://localhost/'))
console.log(routeData)
// console.log(await decode(radableStream))
