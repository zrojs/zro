import { getOrm } from "@zro/db";
import { eq } from "drizzle-orm";
import { Suspense, use, useEffect } from "react";
import { z } from "zod";
import { useAction, useLoaderData } from "zro/react";
import { Action } from "zro/router";
import { tasks } from "../configs/db.schema";

type Route = Routes["/"];

export const loader = async () => {
  const orm = getOrm();
  return {
    tasks: orm.select().from(tasks).all(),
  };
};

export const actions = {
  addTask: new Action({
    input: z.object({
      title: z.string().min(1, "The title is required"),
    }),
    async handler({ title }) {
      const orm = getOrm();
      await orm.insert(tasks).values({ name: title });
      return { ok: true };
    },
  }),
  deleteTask: new Action({
    input: z.object({
      id: z.coerce.number().min(0, "The task ID is required"),
    }),
    async handler({ id }) {
      const orm = getOrm();
      await orm.delete(tasks).where(eq(tasks.id, id));
      return { ok: true };
    },
  }),
};

function CreateTaskInput() {
  const addTaskAction = useAction("/", "addTask");
  useEffect(() => {
    if (addTaskAction.data) {
      (document.getElementsByName("title")[0] as HTMLInputElement).value = "";
      (document.getElementsByName("title")[0] as HTMLInputElement).focus();
    }
  }, [addTaskAction.data]);

  return (
    <form {...addTaskAction.formProps} className="flex gap-2 w-full">
      <div className="flex flex-col gap-1 items-start flex-grow w-full">
        <input
          name="title"
          placeholder="Write a task..."
          className={
            "rounded-md py-1 text-gray-900 pl-4 h-10 w-full border border-inset border-gray-300 bg-white shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" +
            (addTaskAction.errors.title
              ? " border-red-500 focus:ring-red-400"
              : "")
          }
        />
        {addTaskAction.errors.title && (
          <span className="text-xs text-red-500">
            {addTaskAction.errors.title}
          </span>
        )}
      </div>
      <button
        type="submit"
        className="whitespace-nowrap text-sm px-5 py-2.5 h-10 inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none bg-black text-white hover:bg-gray-800 active:bg-gray-900"
      >
        Add Task
      </button>
    </form>
  );
}

function TasksListLoading() {
  return (
    <span className="text-bold text-gray-500 text-sm w-full block text-left">
      Loading tasks...
    </span>
  );
}

function TasksList() {
  const data = useLoaderData<Route>();
  const tasks = use(data.tasks);
  const deleteTaskAction = useAction("/", "deleteTask");

  return (
    <div className="flex flex-col gap-1">
      {!!tasks.length && (
        <span className="text-bold text-gray-500 text-sm w-full block text-left">
          Tasks:
        </span>
      )}
      <div className="flex flex-col gap-2">
        {tasks.map((task) => {
          return (
            <div key={task.id}>
              <div className="group flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                <div className="text-sm text-gray-600">{task.name}</div>
                <form {...deleteTaskAction.formProps} className="contents">
                  <input type="hidden" name="id" value={task.id} />
                  <button
                    type="submit"
                    className="opacity-0 group-hover:opacity-100 cursor-pointer text-gray-500 hover:text-gray-700 transition border rounded-sm hover:border-gray-300 border-transparent"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Homepage() {
  return (
    <div className="mb-12 max-w-xs w-full w-fulls mx-auto flex flex-col gap-2">
      <Suspense>
        <CreateTaskInput />
      </Suspense>
      <Suspense fallback={<TasksListLoading />}>
        <TasksList />
      </Suspense>
    </div>
  );
}
