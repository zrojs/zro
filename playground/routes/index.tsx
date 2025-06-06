import { useAction, useHead, useLoaderData } from "zro/react";
import { Action } from "zro/router";

type Route = Routes["/"];

export const middlewares = [] as const;

export const actions = {
  dummyAction: new Action({
    async handler() {
      return "ho";
    },
  }),
};
let i = 0;

export const loader = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  i += 1;
  return {
    i,
    title: "Welcome to playground",
    description: "This is a playground for testing zro",
  };
};

export default function HomePage() {
  const data = useLoaderData();
  useHead({
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      },
    ],
  });
  const dummyAction = useAction("/", "dummyAction");
  return (
    <form {...dummyAction.formProps} className="flex flex-col gap-2">
      {data.i}
      <span>{JSON.stringify(dummyAction.errors)}</span>
      <span>{JSON.stringify(dummyAction.data)}</span>
      <span>Welcome to homepage</span>
      <button type="submit" className="bg-black text-white">
        do action
      </button>
    </form>
  );
}
