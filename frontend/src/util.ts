import { zodResolver } from "@hookform/resolvers/zod";
import { EmptyObject, Resolver } from "react-hook-form";
import { ErrorMessage } from "./generated-client";
import { ZodRawShape, ZodType } from "zod";

// split an array into chunks of given size
export function chunksOf(size: number, t: any[]): any[][] {
  const chunks = [];
  for (let i = 0; i < t.length; i += size) {
    chunks.push(t.slice(i, i + size));
  }
  return chunks;
}

// remove suffix from a string
export const removeSuffix = (suffix: string, str: string): string =>
  str.endsWith(suffix) ? str.slice(0, -suffix.length) : str;

// capitalize the first letter of a string
export const capitaliseFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

// count number of fields that are _not_ undefined in an object
// useful for checking if any overrides were provided in input forms
export function countDefinedValues(obj: any): number {
  if (!obj) return 0;
  const values = Object.values(obj);
  return values.reduce((acc: number, val) => {
    if (val !== undefined) {
      return acc + 1;
    }
    return acc;
  }, 0);
}

// this is the type react admin uses internally for the form values
type FieldValues = Record<string, any>;
// React admin does not support required fields in the schema, so we need to untype the resolver
export const unTypedZodResolver = (schema: Parameters<typeof zodResolver>[0]) =>
  zodResolver(schema) as Resolver<FieldValues>;

export type Response<T> =
  | {
      data: T;
      error: undefined;
    }
  | {
      data: undefined;
      error: ErrorMessage | EmptyObject;
    };

export const throwOnError = <T>(response: Response<T>): T => {
  const { data, error } = response;
  if (error) {
    throw error;
  }
  return data;
};

// Use Zod schema to get the keys of the fields and if they are required.
export const getFields = <T extends ZodRawShape>(schema: T) => {
  return Object.entries(schema).reduce(
    (acc, [key, value]) => {
      const isNullable =
        "safeParse" in value
          ? (value as ZodType<unknown>).safeParse(undefined).success
          : false;
      acc[key as keyof T] = { required: !isNullable, source: key as keyof T };
      return acc;
    },
    {} as Record<keyof T, { required: boolean; source: keyof T }>,
  );
};
