import { Middleware } from 'zro/router'

export const loader = () => {
  return {
    title: 'Welcome to playground',
    description: 'This is a playground for testing zro',
  }
}

export const middlewares = [
  new Middleware(async ({ next }) => {
    console.log('before middleware 1')
    const n = await next({
      code: false,
    })
    console.log('after middleware 1')
    return n
  }),
]

export function RootLayout() {
  return (
    <div>
      <span>Hi there</span>
      <div>Yo - content</div>
    </div>
  )
}
