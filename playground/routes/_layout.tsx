import { Link, Outlet } from 'zro/react'
import { createHead, Head, UnheadProvider } from 'zro/unhead'
import styles from './styles.css?url'

export const loader = async () => {
  return {
    version: '1.2',
  }
}

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

const head = createHead()
export default function RootLayout() {
  return (
    <UnheadProvider head={head}>
      <Head>
        <link href={styles} rel="stylesheet" />
      </Head>
      <div>
        <div className="flex gap-2 [&>a]:text-blue-700">
          <Link href="/">[HOME]</Link>
          <Link href="/blog">[BLOG]</Link>
          <Link href="/dashboard">[DASHBOARD]</Link>
        </div>
        <Outlet />
      </div>
    </UnheadProvider>
  )
}

export const Loading = () => {
  return <div>Loading...</div>
}
