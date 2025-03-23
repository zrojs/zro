import { Suspense, use } from 'react'
import { Link, useLoaderData } from 'zro/react'
import { posts } from '~/data'

type Route = Routes['/blog/']

export const loader = async () => {
  const timestamp = new Date()
  return {
    timestamp,
    posts: new Promise<typeof posts>(async resolve => {
      await new Promise(r => setTimeout(r.bind(null), 1000))
      resolve([
        ...posts,
        {
          id: 3,
          title: 'Not found',
          content: `-`,
          createdAt: new Date('2021-01-02'),
        },
      ])
    }),
  }
}

export default function BlogPage() {
  const loaderData = useLoaderData<Route>()
  return (
    <div>
      <p>Blog page</p>
      <div>
        <span>{loaderData.timestamp.toString()}</span>
        <Suspense fallback={<div>Loading...</div>}>
          <Posts />
        </Suspense>
      </div>
    </div>
  )
}

const Posts = () => {
  const loaderData = useLoaderData<Route>()
  const posts = use(loaderData.posts)
  return posts.map(({ id, title, createdAt }) => {
    return (
      <Link href={`/blog/${id}`} key={id}>
        <h2>{title}</h2>
        <p>{createdAt.toDateString()}</p>
      </Link>
    )
  })
}

export const Loading = () => {
  return <div>Loading...</div>
}

export const ErrorBoundary = () => {
  return 'Something went wrong!'
}
