import { auth } from "@zro/auth";
import { Outlet, useAction } from "zro/react";

type Route = Routes["/dashboard/_layout"];

export const middlewares = [auth()] as const;

export default function DashboardLayout() {
  const logout = useAction("/auth/logout", "logout");
  return (
    <div className="flex flex-col gap-2">
      <form {...logout.formProps}>
        <button type="submit">Logout</button>
      </form>
      <h1>Dashboard</h1>
      <Outlet />
    </div>
  );
}

export const ErrorBoundary = () => {
  return <span>Error from dashboard</span>;
};
