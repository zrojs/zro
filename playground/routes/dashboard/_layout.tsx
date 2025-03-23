import { Middleware, redirect } from 'zro/router'

export const loader = () => {
  return {
    authenticated: true,
  }
}

export const middlewares = [
  new Middleware(async ({ next }) => {
    await new Promise(r => setTimeout(r, 3000))
    redirect('/')
    return next({
      user: {
        name: 'nariman movaffaghi',
        email: 'nariman.movaffaghi@gmail.com',
      },
    })
  }),
]

export default function DashboardLayout() {
  return (
    <div className="flex flex-col gap-2">
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard</p>
    </div>
  )
}
