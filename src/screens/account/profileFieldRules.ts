/**
 * profileFieldRules.ts
 * Zod checks shared by Create profile and Edit profile, built from utils/rules.ts so both forms
 * show the same messages.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { z } from "zod";

import { displayNameRule, dobRule, genderRule, type RuleResult } from "../../utils/rules";

/** Field name to message, for the fields that fail. "" means invalid but silent. */
export type FormErrors = Record<string, string>;

/**
 * Adds a failed rule to a Zod context.
 * @param ctx The refinement context.
 * @param path The field name.
 * @param result The rule's result.
 */
export function addRule(ctx: z.RefinementCtx, path: string, result: RuleResult): void {
  if (!result.isValid) {
    ctx.addIssue({ code: "custom", path: [path], message: result.message });
  }
}

/**
 * Display name, date of birth and gender (design.md 6.4, 6.17).
 * @param now The current time, for the age check.
 * @returns The schema.
 */
export function aboutYouSchema(now: Date) {
  return z
    .object({
      displayName: z.string(),
      dateOfBirth: z.string(),
      gender: z.string().nullable(),
    })
    .superRefine((value, ctx) => {
      addRule(ctx, "displayName", displayNameRule(value.displayName));
      addRule(ctx, "dateOfBirth", dobRule(value.dateOfBirth, now));
      addRule(ctx, "gender", genderRule(value.gender));
    });
}

/**
 * Runs a schema and collects each field's first message.
 * @param schema A Zod schema.
 * @param values The values.
 * @returns The failing fields.
 */
export function errorsOf(schema: z.ZodType, values: unknown): FormErrors {
  const result = schema.safeParse(values);
  if (result.success) {
    return {};
  }
  const errors: FormErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    if (!(key in errors)) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
