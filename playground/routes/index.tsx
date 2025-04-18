import z from "zod";
import { Action, getRequest } from "zro/router";
import { useHead } from "zro/unhead";

type Route = Routes["/"];

export const actions = {
  login: new Action({
    input: z.object({
      ok: z.stringbool(),
    }),
    async handler(obj) {
      console.log(obj);
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
  useHead({
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      },
    ],
  });
  return <span>Welcome to homepage</span>;
}
