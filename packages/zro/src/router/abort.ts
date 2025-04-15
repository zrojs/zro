import { StandardSchemaV1 } from "@standard-schema/spec";
import { getRequest } from "../router/Router";
import { serializeError } from "../router/safe-response";

export const abort = (
  code: number,
  text?: string,
  issues?: StandardSchemaV1.FailureResult["issues"]
) => {
  const requestCtx = getRequest();
  requestCtx.status = code;
  if (!issues) throw new Error(text);
  throw serializeError(text || "", issues);
};
