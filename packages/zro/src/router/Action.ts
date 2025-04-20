import type { StandardSchemaV1 } from "@standard-schema/spec";
import { getHeader, MultiPartData, readBody, readMultipartFormData } from "h3";
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
  multipartObjToFormDataObject(formData: MultiPartData[]) {
    const result: {
      [key: string]: string | File | Array<string | File>;
    } = {};

    for (const item of formData) {
      // Skip items without a name
      if (!item.name) continue;

      // Determine the value based on the item
      let value: string | File;

      // If it's a file (has filename and type), create a File object
      if (typeof item.filename !== "undefined") {
        // Create a File object from the buffer data
        const file = new File([item.data], item.filename, { type: item.type });
        value = file;
      } else {
        // Try to convert Buffer to string if possible
        try {
          // Check if buffer is empty
          if (item.data.length === 0) {
            value = "";
          } else {
            // Try to convert to string
            const textValue = item.data.toString("utf-8");
            value = textValue;
          }
        } catch (error) {
          // If conversion fails, create a plain file object without type
          const file = new File([item.data], "unknown");
          value = file;
        }
      }

      // Handle duplicate keys by converting to array
      if (item.name in result) {
        if (Array.isArray(result[item.name])) {
          // Already an array, just push
          (result[item.name] as Array<any>).push(value);
        } else {
          // Convert to array with both values
          result[item.name] = [result[item.name] as string | File, value];
        }
      } else {
        // First occurrence of this key
        result[item.name] = value;
      }
    }

    return result;
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
    const contentType = getHeader(event, "content-type");
    if (contentType?.toLowerCase().startsWith("multipart/form-data;")) {
      const dataMultipart = (await readMultipartFormData(event))!;
      data = this.multipartObjToFormDataObject(dataMultipart);
    } else {
      data = await readBody(event);
    }

    const body = await this.validateInput(data);
    return handler(body);
  }
}
