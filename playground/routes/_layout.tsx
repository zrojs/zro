import { Link, Outlet } from 'zro/react'
import { useHead } from 'zro/unhead'
import styles from './styles.css?url'

// export const loader = async () => {
//   return {
//     version: '1.2',
//   }
// }

// export const middlewares = [
//   new Middleware(async ({ next }) => {
//     // console.log('before middleware 1')
//     const n = await next({
//       code: false,
//     })
//     // console.log('after middleware 1')
//     return n
//   }),
// ]

export default function RootLayout() {
  useHead({
    htmlAttrs: {
      lang: 'en',
    },
    bodyAttrs: {
      class: 'bg-red-300',
    },
    link: [
      {
        href: styles,
        rel: 'stylesheet',
      },
    ],
    script: [
      {
        type: 'module',
        src: '/app.tsx',
        tagPosition: 'bodyClose',
      },
    ],
  })
  return (
    <div>
      <div className="flex gap-2 [&>a]:text-blue-700">
        <Link href="/">[HOME]</Link>
        <Link href="/blog">[BLOG]</Link>
        <Link href="/dashboard">[DASHBOARD]</Link>
      </div>
      <div id="app" />
      <Outlet />
    </div>
  )
}

// TODO: fix this

// export const Loading = () => {
//   return <div>Loading...</div>
// }
