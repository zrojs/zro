import type { FC } from "react";
import { Outlet, useHead, type ErrorBoundaryProps } from "zro/react";
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
