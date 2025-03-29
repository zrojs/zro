import { Suspense, use } from "react";
import { Link, useLoaderData } from "zro/react";
import { useHead } from "zro/unhead";
import { posts } from "~/data";

type Route = Routes["/blog/"];

export const loader = async () => {
  const timestamp = new Date();
  return {
    timestamp,
    posts: new Promise<typeof posts>(async (resolve) => {
      await new Promise((r) => setTimeout(r.bind(null), 1000));
      resolve([
        ...posts,
        {
          id: 3,
          title: "Not found",
          content: `-`,
          createdAt: new Date("2021-01-02"),
        },
      ]);
    }),
  };
};

export default function BlogPage() {
  const loaderData = useLoaderData<Route>();
  useHead({
    title: "Blog",
  });

  return (
    <div>
      <p>Blog page</p>
      <div className="flex flex-col gap-4">
        <span>{loaderData.timestamp.toString()}</span>
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
            <p className="text-sm font-light">{createdAt.toDateString()}</p>
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
