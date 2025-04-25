import { guest } from "@zro/auth";
import { useAction } from "zro/react";

export const middlewares = [guest("/tasks")] as const;

export default function LoginPage() {
  const loginAction = useAction("/_auth/password", "signIn");
  return (
    <form
      {...loginAction.formProps}
      className="max-w-2xs flex flex-col gap-2 mx-auto w-full mb-12"
    >
      <input
        name="username"
        placeholder="me@nariman.mov"
        className={
          "rounded-md py-1 text-gray-900 pl-4 h-10 w-full border border-inset border-gray-300 bg-white shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" +
          (loginAction.errors.username
            ? " border-red-500 focus:ring-red-400"
            : "")
        }
      />
      <input
        name="password"
        type="password"
        placeholder="1234"
        className={
          "rounded-md py-1 text-gray-900 pl-4 h-10 w-full border border-inset border-gray-300 bg-white shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" +
          (loginAction.errors.password
            ? " border-red-500 focus:ring-red-400"
            : "")
        }
      />
      {loginAction.errors.root && (
        <span className="text-red-500 text-sm">{loginAction.errors.root}</span>
      )}
      <button
        type="submit"
        className="whitespace-nowrap text-sm px-5 py-2.5 h-10 inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none bg-black text-white hover:bg-gray-800 active:bg-gray-900"
      >
        Login
      </button>
    </form>
  );
}
