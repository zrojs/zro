import { Link } from "zro/react";

type Route = Routes["/"];

export default function Homepage() {
  return (
    <div className="mb-12 max-w-xs w-full w-fulls mx-auto flex flex-col gap-2">
      <div className="flex gap-2 items-center justify-center">
        <Link href="/auth/login" className="text-blue-400">
          Login
        </Link>
        <Link href="/tasks" className="text-blue-400">
          Add Task
        </Link>
      </div>
    </div>
  );
}
