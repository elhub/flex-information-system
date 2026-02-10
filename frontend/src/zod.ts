import { zodResolver } from "@hookform/resolvers/zod";
import { ZodRawShape, ZodType } from "zod";
import { $ZodRawIssue, $ZodTypeInternals } from "zod/v4/core";
import { Resolver } from "react-hook-form";

// this is the type react admin uses internally for the form values
type FieldValues = Record<string, any>;
type Schema = ZodType<
  unknown,
  FieldValues,
  $ZodTypeInternals<unknown, FieldValues>
> & { shape: ZodRawShape };

const customErrorHandler = (schema: ZodRawShape, issue: $ZodRawIssue) => {
  console.log(issue, "issue");
  if (issue.code === "invalid_format" && issue.format === "regex") {
    // Handle the regex
    return "Wrong format";
  }

  if (issue.code === "invalid_type" && issue.input === null) {
    //Fix Invalid input: expected string, received null error message
    return "Required";
  }

  return issue.message;
};

// React admin does not support required fields in the schema, so we need to untype the resolver
export const unTypedZodResolver = (schema: Schema) => {
  return zodResolver(schema, {
    error: (issue) => customErrorHandler(schema.shape, issue),
  }) as Resolver<FieldValues>;
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
