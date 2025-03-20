import { Link, Outlet } from 'zro/react'
import { MetaFunction, Middleware } from 'zro/router'
import styles from './styles.css?url'

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

export const meta: MetaFunction<any> = () => {
  return {
    link: [
      {
        href: styles,
        rel: 'stylesheet',
      },
    ],
  }
}

export default function RootLayout() {
  return (
    <div>
      <div className="flex gap-2">
        <Link href="/">[HOME]</Link>
        <Link href="/blog">[BLOG]</Link>
      </div>
      <Outlet />
    </div>
  )
}
