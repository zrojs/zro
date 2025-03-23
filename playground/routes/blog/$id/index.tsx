import { useLoaderData } from 'zro/react'
import { useRequest } from 'zro/router'
import { posts } from '~/data'

type Route = Routes['/blog/:id/']

export const loader = () => {
  const requestContext = useRequest()
  const { id } = requestContext.params
  const post = posts.find(post => String(post.id) == id)
  if (!post) throw new Error('Post not found')
  return posts.find(post => String(post.id) == id)
}

export default function SingleBlog() {
  const loaderData = useLoaderData<Route>()
  return (
    <div className="flex flex-col gap-2">
      <h1>{loaderData.title}</h1>
      <p>{loaderData.content}</p>
    </div>
  )
}

export const Loading = () => {
  return <div>Loading blog post...</div>
}

export const ErrorBoundary = () => {
  return 'Something went wrong!'
}
