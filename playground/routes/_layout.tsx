import { Link, Outlet, useLoaderData } from "zro/react";
import { Head } from "zro/unhead";
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
  const loaderData = useLoaderData<Route>();
  const [title, setTitle] = useState(loaderData.version);

  return (
    <div>
      <Head>
        <link href={styles} rel="stylesheet" />
        <title>{loaderData.version}</title>
      </Head>
      <div className="flex gap-2 [&>a]:text-blue-700">
        <Link href="/">[HOME]</Link>
        <Link href="/blog">[BLOG]</Link>
        <Link href="/dashboard">[DASHBOARD]</Link>
      </div>
      <div id="app" />
      <Outlet />
    </div>
  );
}

// TODO: fix this

// export const Loading = () => {
//   return <div>Loading...</div>
// }
