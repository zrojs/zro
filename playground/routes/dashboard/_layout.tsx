import { Outlet, useLoaderData } from 'zro/react'
import { Middleware } from 'zro/router'

type Route = Routes['/dashboard/_layout']

export const loader = () => {
  return {
    authenticated: true,
  }
}

export const middlewares = [
  new Middleware(async ({ next }) => {
    // redirect('/') // TODO: bug, when redirect to /, the component renders! and throws error for data access <p>Welcome to the dashboard, {loaderData.user.name}</p>
    return next({
      user: {
        name: 'nariman movaffaghi',
        email: 'nariman.movaffaghi@gmail.com',
      },
    })
  }),
] as const

export default function DashboardLayout() {
  const loaderData = useLoaderData<Route>()
  return (
    <div className="flex flex-col gap-2">
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard, {loaderData.user.name}</p>
      <Outlet />
    </div>
  )
}
