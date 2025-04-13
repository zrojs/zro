import { useLoaderData } from "zro/react";
import { useHead } from "zro/unhead";

type Route = Routes["/dashboard/"];

export const loader = async () => {
  return {};
};

export default function DashboardPage() {
  const data = useLoaderData<Route>(); // merged parent, middlewares, and loader
  useHead({
    title: "Dashboard",
    titleTemplate(title) {
      return `${title} | ${data.user.name}`;
    },
  });
  return <div>dashboard is here {JSON.stringify(data.user)}</div>;
}
