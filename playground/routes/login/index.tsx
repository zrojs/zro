import { guest } from "@zro/auth";
import { useAction } from "zro/react";

export const middlewares = [guest("/dashboard")];

export default function LoginPage() {
  const loginAction = useAction("/auth/password", "signIn");
  return (
    <form
      className="flex flex-col gap-2 max-w-sm mx-auto"
      {...loginAction.formProps}
    >
      <input
        className="border border-gray-300 rounded-md px-2 py-1"
        placeholder="example@email.com"
        name="username"
        defaultValue="me@nariman.mov"
      />
      <input
        className="border border-gray-300 rounded-md px-2 py-1"
        placeholder="••••••••••"
        type="password"
        name="password"
        defaultValue="1234"
      />
      <button className="bg-gray-700 px-2 py-1 rounded-md text-white">
        login
      </button>
      <a href="/auth/github">
        <button type="button">Login with github</button>
      </a>
    </form>
  );
}
