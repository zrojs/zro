import { auth } from "@zro/auth";
import { Link, Outlet, useLoaderData } from "zro/react";
import { User } from "~/configs/auth";

type Route = Routes["/dashboard/_layout"];

// export const middlewares = [
//   new Middleware(async ({ next }) => {
//     // redirect("/blog"); // TODO: bug, when redirect to /, the component renders! and throws error for data access <p>Welcome to the dashboard, {loaderData.user.name}</p>
//     return next({
//       user: {
//         name: "nariman movaffaghi",
//         email: "nariman.movaffaghi@gmail.com",
//       },
//     });
//   }),
// ] as const;

export const middlewares = [auth<User>()];

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
