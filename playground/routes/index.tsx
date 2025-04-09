import { getRequest } from "zro/router";
import { deleteCookie, getSession } from "zro/router/server";

type Route = Routes["/"];

export const loader = async () => {
  const { request } = getRequest();

  const session = await getSession<{ user?: string }>({
    password: process.env.AUTH_SESSION_KEY!,
  });

  console.log(session.id);
  console.log(deleteCookie("hello"));

  /*
  const session = getSession();
  session.update({
    user: false
  })
  */
  return {
    title: "Welcome to playground",
    description: "This is a playground for testing zro",
  };
};

export default function HomePage() {
  return <span>Welcome to homepage</span>;
}
