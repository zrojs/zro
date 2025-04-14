import { auth } from "@zro/auth";
import { Link, Outlet } from "zro/react";

type Route = Routes["/dashboard/_layout"];

export const middlewares = [auth()] as const;

export default function DashboardLayout() {
  return (
    <div className="flex flex-col gap-2">
      <Link href="/logout" className="text-blue-500">
        logout
      </Link>
      <h1>Dashboard</h1>
      <Outlet />
    </div>
  );
}

export const ErrorBoundary = () => {
  return <span>Error from dashboard</span>;
};
