import { getOrm } from "@zro/db";
import * as schema from "configs/db.schema";
import { eq } from "drizzle-orm";
import { ErrorBoundaryProps, useLoaderData } from "zro/react";
import { abort, getRequest } from "zro/router";
import { useHead } from "zro/unhead";

type Route = Routes["/blog/:id/"];

export const loader = async () => {
  const requestContext = getRequest();
  const { id } = requestContext.params;
  const orm = getOrm();
  const post = await orm
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.id, parseInt(id)))
    .get();

  if (!post) abort(404, "Post not found");
  return {
    post,
  };
};

export default function SingleBlog() {
  const { post } = useLoaderData<Route>();
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
