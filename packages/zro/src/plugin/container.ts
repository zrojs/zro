import { createContext } from "unctx";

export const PluginContainer = createContext<{ plugins: Map<string, any> }>();
PluginContainer.set({ plugins: new Map<string, any>() });
export const usePluginContainer = PluginContainer.use;
