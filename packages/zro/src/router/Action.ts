import type { StandardSchemaV1 } from "@standard-schema/spec";
import { getRequest } from "src/router/Router";
import { abort } from "src/router/utils";

export class Action<TSchema extends StandardSchemaV1, ReturnType> {
  constructor(
    public options: {
      input: TSchema;
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
    let result = this.options.input["~standard"].validate(input);
    if (result instanceof Promise) result = await result;
    if (result.issues) {
      abort(400, "Invalid input", result.issues);
      return;
    }
    return result.value;
  }
  async run() {
    const { handler } = this.options;
    const { request } = getRequest();
    const body = await this.validateInput(
      this.formDataToObject(await request.formData())
    );
    return handler(body);
  }
}
