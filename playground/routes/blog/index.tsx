import { getOrm } from "@zro/db";
import * as schema from "configs/db.schema";
import { Suspense, use } from "react";
import { Link, useLoaderData } from "zro/react";
import { useHead } from "zro/unhead";

type Route = Routes["/blog/"];

export const loader = async () => {
  const orm = getOrm<typeof schema>();

  return {
    posts: new Promise(async (resolve) => {
      await new Promise((r) => setTimeout(r, 5000));
      return resolve(orm.select().from(schema.posts).all());
    }),
  };
};

export default function BlogPage() {
  useHead({
    title: "Blog",
  });

  return (
    <div>
      <p>Blog page</p>
      <div className="flex flex-col gap-4">
        <Suspense fallback={<div>Loading...</div>}>
          <Posts />
        </Suspense>
      </div>
    </div>
  );
}

const Posts = () => {
  const loaderData = useLoaderData<Route>();
  const posts = use(loaderData.posts);

  return (
    <div className="flex gap-2 flex-col">
      {posts.map(({ id, title, createdAt }) => {
        return (
          <Link href={`/blog/${id}`} key={id} className="text-blue-700">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm font-light">
              {new Date(createdAt).toDateString()}
            </p>
          </Link>
        );
      })}
    </div>
  );
};

export const Loading = () => {
  return <div>Loading blog...</div>;
};

export const ErrorBoundary = () => {
  return "Something went wrong!";
};
