import { useHead, useLoaderData } from "zro/react";

type Route = Routes["/dashboard/"];

export default function DashboardPage() {
  const data = useLoaderData<Route>(); // merged parent, middlewares, and loader
  useHead({
    title: "Dashboard",
    titleTemplate(title) {
      return `${title} | ${data.user.email}`;
    },
  });
  return <div>dashboard is here {data.user.email}</div>;
}
