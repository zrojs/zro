import { StandardSchemaV1 } from "@standard-schema/spec";
import { set } from "es-toolkit/compat";
import { getRequest } from "src/router/Router";

export const safeRespose = async <T>(fn: () => T | Promise<T>) => {
  const request = getRequest();
  try {
    const result = await fn();
    if (result instanceof Response) {
      return result;
    }
    if (result instanceof Error) {
      if (request.status < 400) request.status = 400;
      return serializeError(result);
    }
    return result;
  } catch (result) {
    if (result instanceof Response) {
      return result;
    }
    if (result instanceof Error) {
      if (request.status < 400) request.status = 400;
      return serializeError(result);
    }
    return result;
  }
};

type ErrorResponse = {
  message: string;
  errors?: Record<string, Set<string>>;
};

export const serializeError = (
  error: Error | string,
  issues: StandardSchemaV1.FailureResult["issues"] = []
): ErrorResponse => {
  const errors = {};
  for (const issue of issues) {
    if (issue.path) set(errors, issue.path as string[], issue.message);
  }
  return {
    message: error instanceof Error ? error.message : error,
    errors,
  };
};
