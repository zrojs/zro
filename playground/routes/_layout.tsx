import { Link, Outlet, useLoaderData } from "zro/react";
import { Head, useHead } from "zro/unhead";
import styles from "./styles.css?url";
import { useEffect, useState } from "react";

type Route = Routes["/_layout"];

export const loader = async () => {
  return {
    version: "1.2",
  };
};

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
    link: [{ rel: "stylesheet", href: styles }],
  });
  const loaderData = useLoaderData<Route>();

  return (
    <div>
      <Head>
        <title>{loaderData.version}</title>
      </Head>
      <div className="flex gap-2 [&>a]:text-blue-700">
        <Link href="/">[HOME]</Link>
        <Link href="/blog">[BLOG]</Link>
        <Link href="/dashboard">[DASHBOARD]</Link>
      </div>
      <Outlet />
    </div>
  );
}

export const Loading = () => {
  return <div>Loading main layout...</div>;
};
