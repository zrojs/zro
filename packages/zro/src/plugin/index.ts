import { RouteTree } from "./context";
export * from "./context";

export interface Plugin<TConfig> {
  name: string;
  configFileName: string;
  setup(tree: RouteTree): Promise<void> | void;
}
