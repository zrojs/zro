import { useDataContext } from 'zro/router'

type Route = Routes['/dashboard/']

export const loader = async () => {
  const data = useDataContext<Route>()
  data.authenticated
  return {}
}
export default function DashboardPage() {
  return <div>hi</div>
}
