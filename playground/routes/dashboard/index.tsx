import { useLoaderData } from 'zro/react'
import { MetaFunction, useDataContext, useHead } from 'zro/router'

type Route = Routes['/dashboard/']

export const meta: MetaFunction = () => {
  const data = useDataContext<Route>()
  return {
    title: 'Dashboard',
    titleTemplate(title) {
      return `${title} | ${data.user.name}`
    },
  }
}

export const loader = async () => {
  const data = useDataContext<Route>() // merged parent and middlewares
  const head = useHead()

  return {}
}
export default function DashboardPage() {
  const data = useLoaderData<Route>() // merged parent, middlewares, and loader

  return <div>hi</div>
}
