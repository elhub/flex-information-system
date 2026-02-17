import { EmptyObject } from "react-hook-form";
import { ErrorMessage } from "./generated-client";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

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

// CN is a standard utility function for merging classes
export const cn = (...classes: (string | undefined)[]): string => {
  return twMerge(clsx(classes));
};
