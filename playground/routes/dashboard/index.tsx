import { useLoaderData } from 'zro/react'
import { getLoaderData, MetaFunction } from 'zro/router'

type Route = Routes['/dashboard/']

export const meta: MetaFunction = () => {
  const data = getLoaderData<Route>()
  return {
    title: 'Dashboard',
    titleTemplate(title) {
      return `${title} | ${data.user.name}`
    },
  }
}

export const loader = async () => {
  return {}
}
export default function DashboardPage() {
  const data = useLoaderData<Route>() // merged parent, middlewares, and loader

  return <div>hi</div>
}
