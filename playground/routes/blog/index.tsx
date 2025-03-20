import { Suspense, use } from 'react'
import { Link, useLoaderData } from 'zro/react'
import { posts } from '~/data'

export const loader = () => {
  return {
    posts: new Promise(r => setTimeout(r.bind(null, posts), 500)),
  }
}

export default function () {
  return (
    <div>
      <p>Blog page</p>
      <div>
        <Suspense fallback="Loading posts...">
          <Posts />
        </Suspense>
      </div>
    </div>
  )
}
const Posts = () => {
  const loaderData = useLoaderData()
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
