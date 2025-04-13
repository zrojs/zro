import { guest } from "@zro/auth";
import { Link, useAction } from "zro/react";

export const middlewares = [guest("/dashboard")];

export default function LoginPage() {
  const action = useAction("/auth/password?action=signIn");
  return (
    <form
      className="flex flex-col gap-2 max-w-sm mx-auto"
      {...action.formProps}
    >
      <input
        className="border border-gray-300 rounded-md px-2 py-1"
        placeholder="example@email.com"
        name="username"
      />
      <input
        className="border border-gray-300 rounded-md px-2 py-1"
        placeholder="••••••••••"
        type="password"
        name="password"
      />
      <button className="bg-gray-700 px-2 py-1 rounded-md text-white">
        login
      </button>
      <Link href="/auth/github">
        <button type="button">Login with github</button>
      </Link>
    </form>
  );
}
