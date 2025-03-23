import { useLoaderData } from 'zro/react'
import { useDataContext } from 'zro/router'

type Route = Routes['/dashboard/']

export const loader = async () => {
  const data = useDataContext<Route>() // merged parent and middlewares
  return {}
}
export default function DashboardPage() {
  const data = useLoaderData<Route>() // merged parent, middlewares, and loader

  return <div>hi</div>
}
