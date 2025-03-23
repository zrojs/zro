import { useDataContext } from 'zro/router'

type Route = Routes['/']

export const loader = () => {
  const data = useDataContext<Route>()

  return {
    title: 'Welcome to playground',
    description: 'This is a playground for testing zro',
  }
}

export default function HomePage() {
  return <span>Welcome to homepage</span>
}
