import { Outlet, useHead, useLoaderData } from "zro/react";
import styles from "./styles.css?url";

type Route = Routes["/_layout"];

export const loader = () => {
  return { filePath: new URL(import.meta.url).pathname };
};

export default function MainLayout() {
  const { filePath } = useLoaderData<Route>();
  const openFileEditor = () => fetch(`/__open-in-editor?file=${filePath}`);
  useHead({
    link: [
      {
        rel: "stylesheet",
        href: styles,
      },
    ],
    title: "Welcome to Z۰RO",
  });
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center flex flex-col">
          <img src="/favicon.ico" className="w-8 h-8 mx-auto mb-4" />
          <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
            Welcome to{" "}
            <span className="inline-flex items-center justify-center">
              [Z۰RO]
            </span>
          </h1>

          <p className="text-lg text-gray-600 mb-12">
            Your journey to building amazing applications starts here
          </p>
          <Outlet />

          <button
            onClick={openFileEditor}
            className="cursor-pointer hover:bg-gray-100 transition max-w-md mx-auto text-md bg-gray-50 border border-gray-200 rounded-xl p-6 mb-12 text-left"
          >
            <span className="flex items-center justify-center space-x-3">
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
                className="w-6 h-6 text-black mt-1 flex-shrink-0"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
              <span className="flex gap-4 w-full items-center">
                <span className="text-black font-medium">
                  Get started by editing
                </span>
                <code className="rounded-md text-black font-mono">
                  ./routes/index.tsx
                </code>
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
