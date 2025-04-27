import { Action } from "zro/router";
import { logout } from "..";

export const actions = {
  logout: new Action({ handler: logout }),
};
