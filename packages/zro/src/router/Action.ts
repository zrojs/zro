import type { StandardSchemaV1 } from "@standard-schema/spec";
import { readBody } from "h3";
import { abort } from "./abort";
import { getServerContext } from "./server/context";

export interface Actions {}
export type InferActionSchema<TAction extends Action<any, any>> =
  TAction extends Action<infer TSchema, infer TReturnType>
    ? StandardSchemaV1.InferInput<TSchema>
    : never;
export type InferActionReturnType<TAction extends Action<any, any>> =
  TAction extends Action<infer TSchema, infer TReturnType>
    ? TReturnType
    : never;
export class Action<TSchema extends StandardSchemaV1, ReturnType> {
  constructor(
    public options: {
      input?: TSchema;
      handler: (
        input: StandardSchemaV1.InferInput<TSchema>
      ) => Promise<ReturnType> | ReturnType;
    }
  ) {}

  private formDataToObject(formData: FormData) {
    const obj: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (typeof obj[key] !== "undefined") {
        if (!Array.isArray(obj[key])) {
          obj[key] = [obj[key]];
        }
        obj[key].push(value);
      } else {
        obj[key] = value;
      }
    });
    return obj;
  }
  async validateInput(
    input: StandardSchemaV1.InferInput<TSchema>
  ): Promise<StandardSchemaV1.InferInput<TSchema>> {
    if (this.options.input) {
      let result = this.options.input["~standard"].validate(input);
      if (result instanceof Promise) result = await result;
      if (result.issues) {
        abort(400, "Invalid input", result.issues);
        return;
      }
      return result.value;
    }
    return {};
  }
  async run() {
    const { handler } = this.options;

    const { event } = getServerContext()!;

    let data;
    const contentType = event.req.headers.get("content-type");
    if (contentType?.toLowerCase().startsWith("multipart/form-data;")) {
      const dataMultipart = (await event.req.formData())!;
      data = this.formDataToObject(dataMultipart);
    } else {
      data = await readBody(event);
    }

    const body = await this.validateInput(data);
    return handler(body);
  }
}
