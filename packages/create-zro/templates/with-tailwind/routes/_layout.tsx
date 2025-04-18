import type { FC } from "react";
import { Outlet, type ErrorBoundaryProps } from "zro/react";
import { useHead } from "zro/unhead";
import styles from "./styles.css?url";

export default function MainLayout() {
  useHead({
    link: [
      {
        rel: "stylesheet",
        href: styles,
      },
    ],
    title: "Welcome to Z۰RO",
  });
  return <Outlet />;
}

export const ErrorBoundary: FC<ErrorBoundaryProps> = ({ error }) => {
  useHead({
    link: [
      {
        rel: "stylesheet",
        href: styles,
      },
    ],
    title: "Welcome to Z۰RO",
  });
  return <span>Something went wrong!</span>;
};
