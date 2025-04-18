import type { StandardSchemaV1 } from "@standard-schema/spec";
import { abort } from "./abort";
import { getServerContext } from "./server/context";
import { readBody } from "h3";

export interface Actions {}

export class Action<TSchema extends StandardSchemaV1, ReturnType> {
  constructor(
    public options: {
      input?: TSchema;
      handler: (
        input: StandardSchemaV1.InferInput<TSchema>
      ) => Promise<ReturnType>;
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
    const data = await readBody(event);

    const body = await this.validateInput(data);
    return handler(body);
  }
}
