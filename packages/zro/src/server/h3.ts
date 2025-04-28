import { H3, type H3Config } from "h3";

export const createH3App = (config?: H3Config) => {
  return new H3(config);
};
