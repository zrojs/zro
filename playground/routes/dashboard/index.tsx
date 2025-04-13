import { useLoaderData } from "zro/react";
import { useHead } from "zro/unhead";

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
