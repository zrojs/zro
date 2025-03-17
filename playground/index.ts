import { Middleware, Route, Router } from 'zro/router'

const router = new Router()
const rootRoute = new Route('_root', {
  loader: async () => ({ ok: true }),
})

const index = new Route('/', {
  parent: rootRoute,
  loader: async () => ({ heading: 'Welcome To Z۰RO', description: 'Focused on modularity' }),
  middlewares: [
    new Middleware(({ next }) => {
      return next({
        user: {
          name: 'nariman',
        },
      })
    }),
  ],
})

router.addRoute(index)

console.log('hello world')
