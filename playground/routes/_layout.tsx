import { Link, Outlet } from 'zro/react'
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
  return (
    <html>
      <head>
        <link href={styles} rel="stylesheet" />
      </head>
      <body>
        <div>
          <div className="flex gap-2 [&>a]:text-blue-700">
            <Link href="/">[HOME]</Link>
            <Link href="/blog">[BLOG]</Link>
            <Link href="/dashboard">[DASHBOARD]</Link>
          </div>
          <Outlet />
        </div>
        <script type="module" src="/app.tsx"></script>
      </body>
    </html>
  )
}

// TODO: fix this

// export const Loading = () => {
//   return <div>Loading...</div>
// }
