import { ErrorBoundaryProps, Link, Outlet, useLoaderData } from "zro/react";
import { Head, useHead, useUnhead } from "zro/unhead";
import styles from "./styles.css?url";

type Route = Routes["/_layout"];

export const loader = async () => {
  return {
    version: "1.2",
  };
};

export default function RootLayout() {
  useHead({
    link: [{ rel: "stylesheet", href: styles }],
  });
  // const loaderData = useLoaderData<Route>();

  return (
    <div>
      <Head>{/* <title>{loaderData.version}</title> */}</Head>
      <div className="flex gap-2 [&>a]:text-blue-700">
        <Link href="/">[HOME]</Link>
        <Link href="/blog">[BLOG]</Link>
        <Link href="/dashboard">[DASHBOARD]</Link>
        <Link href="/login">[Login]</Link>
      </div>
      <Outlet />
    </div>
  );
}

export const Loading = () => {
  return <div>Loading main layout...</div>;
};

export const ErrorBoundary = (props: ErrorBoundaryProps) => {
  return props.error.message;
};
