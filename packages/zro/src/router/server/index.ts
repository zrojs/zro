import { StandardSchemaV1 } from "@standard-schema/spec";
import type { SessionConfig } from "h3";
import {
  deleteCookie as h3DeleteCookie,
  H3Event,
  getCookie as h3GetCookie,
  setCookie as h3SetCookie,
  useSession,
} from "h3";
import { PluginConfigContext } from "../../plugin";
import { Action } from "../../router/Action";
import { getServerContext } from "./context";

export { SessionConfig };

export const getEvent = (): H3Event => {
  return getServerContext()?.event as H3Event;
};
export const getSession = async <
  TSessionData extends Record<string, any> = Record<string, any>
>(
  config: SessionConfig
): ReturnType<typeof useSession<TSessionData>> => {
  const event = getEvent();
  const session = await useSession<TSessionData>(event, config);
  return session;
};

export const setCookie = (
  name: string,
  value: string,
  options?: Parameters<typeof h3SetCookie>[3]
) => {
  return h3SetCookie(getEvent(), name, value, options);
};

export const getCookie = (name: string) => {
  return h3GetCookie(getEvent(), name);
};

export const deleteCookie = (
  name: string,
  options?: Parameters<typeof h3DeleteCookie>[2]
) => {
  return h3DeleteCookie(getEvent(), name, options);
};

export const wrapWithConfig = <TSchema extends StandardSchemaV1>(
  action: Action<TSchema, any>,
  config: any
) => {
  let _handler = action.options.handler;
  action.options.handler = (input: StandardSchemaV1.InferInput<TSchema>) =>
    PluginConfigContext.call(config, () => {
      return _handler(input);
    });
  return action;
};
