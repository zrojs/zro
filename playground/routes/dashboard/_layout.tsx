import { auth } from "@zro/auth";
import { Link, Outlet, useLoaderData } from "zro/react";

type Route = Routes["/dashboard/_layout"];

export const middlewares = [auth()] as const;

export default function DashboardLayout() {
  const loaderData = useLoaderData<Route>();

  return (
    <div className="flex flex-col gap-2">
      <Link href="/logout" className="text-blue-500">
        logout
      </Link>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard</p>
      <Outlet />
    </div>
  );
}
