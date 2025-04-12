import { StandardSchemaV1 } from "@standard-schema/spec";
import { getRequest } from "src/router/Router";
import { serializeError } from "src/router/utils/safe-response";

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
