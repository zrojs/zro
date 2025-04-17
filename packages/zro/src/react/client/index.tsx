import { FC } from "react";
import { router } from "virtual:zro/router.client";
import { Router } from "../index";
import React from "react";

export const ClientRouter: FC = () => {
  return React.createElement(Router, { router });
};
