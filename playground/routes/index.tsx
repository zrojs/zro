import z from "zod";
import { Action } from "zro/router/Action";
import { getRequest } from "zro/router/Router";
type Route = Routes["/"];

export const actions = {
  login: new Action({
    input: z.object({
      username: z.string(),
      password: z.string(),
    }),
    async handler({ password, username }) {
      console.log(username, password);
      return true;
    },
  }),
};

export const loader = async () => {
  const { request } = getRequest();

  // const session = await getSession<{ user?: string }>({
  //   password: process.env.AUTH_SESSION_KEY!,
  // });

  // console.log(session.id);
  // console.log(deleteCookie("hello"));

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
