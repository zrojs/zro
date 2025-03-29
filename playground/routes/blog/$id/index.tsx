import { use } from "react";
import { ErrorBoundaryProps, useLoaderData } from "zro/react";
import { getRequest } from "zro/router";
import { useHead } from "zro/unhead";
import { posts } from "~/data";

type Route = Routes["/blog/:id/"];

export const loader = async () => {
  const requestContext = getRequest();
  const { id } = requestContext.params;
  const post = posts.find((post) => String(post.id) == id);
  if (!post) throw new Error("Post not found");
  return {
    post: new Promise<(typeof posts)[number]>(async (resolve) => {
      await new Promise((r) => setTimeout(r, 1000));
      resolve(posts.find((post) => String(post.id) == id)!);
    }),
  };
};

export default function SingleBlog() {
  const loaderData = useLoaderData<Route>();
  const post = use(loaderData.post);
  useHead({
    title: post.title,
    titleTemplate(title) {
      return `${title} - Blog`;
    },
  });
  return (
    <div className="flex flex-col gap-2">
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}

export const Loading = () => {
  return <div>Loading blog post...</div>;
};

export const ErrorBoundary = (props: ErrorBoundaryProps) => {
  return props.error.message;
};
