import { Middleware, redirect } from 'zro/router'

export const middlewares = [
  new Middleware(({ next }) => {
    redirect('/')
    return next()
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
