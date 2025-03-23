import { Outlet } from 'zro/react'
import { Middleware } from 'zro/router'

export const loader = () => {
  return {
    authenticated: true,
  }
}

export const middlewares = [
  new Middleware(({ next }) =>
    next({
      user: {
        name: 'nariman movaffaghi',
        email: 'nariman.movaffaghi@gmail.com',
      },
    }),
  ),
] as const

export default function DashboardLayout() {
  return (
    <div className="flex flex-col gap-2">
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard</p>
      <Outlet />
    </div>
  )
}
