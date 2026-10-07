/**
 * profile.ts
 * The gender list (hardcoded, api-integration.md 6.6) and the mapping between the "Interested in"
 * chips and the API's targetGenders.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */

/** Gender values sent to the API, with their labels. Change when the team fixes the list (9.1). */
export const GENDERS = [
  { value: "female", label: "Woman", plural: "Women" },
  { value: "male", label: "Man", plural: "Men" },
  { value: "non_binary", label: "Non-binary", plural: "Non-binary people" },
  { value: "prefer_not_to_say", label: "Prefer not to say", plural: null },
] as const;

/** A gender wire value. */
export type Gender = (typeof GENDERS)[number]["value"];

/** The "Interested in" / "Show me" chips. */
export const TARGET_CHIPS = ["Women", "Men", "Everyone"] as const;

/** One "Interested in" chip. */
export type TargetChip = (typeof TARGET_CHIPS)[number];

/** Every gender wire value, in list order. */
export const ALL_GENDERS: Gender[] = GENDERS.map((g) => g.value);

/**
 * Turns an "Interested in" chip into the API's targetGenders.
 * @param chip The chip label.
 * @returns ["female"], ["male"], or every value in GENDERS for "Everyone".
 */
export function chipToTargetGenders(chip: TargetChip): Gender[] {
  if (chip === "Women") {
    return ["female"];
  }
  if (chip === "Men") {
    return ["male"];
  }
  return [...ALL_GENDERS];
}

/**
 * Finds the chip that matches a targetGenders list, to prefill a form.
 * @param genders The list from the API.
 * @returns The matching chip, or null when the list matches none of them.
 */
export function targetGendersToChip(genders: readonly string[]): TargetChip | null {
  const unique = new Set(genders);
  if (unique.size === 1 && unique.has("female")) {
    return "Women";
  }
  if (unique.size === 1 && unique.has("male")) {
    return "Men";
  }
  if (ALL_GENDERS.every((g) => unique.has(g))) {
    return "Everyone";
  }
  return null;
}

/**
 * Describes a targetGenders list for "Looking for".
 * @param genders The list from the API.
 * @returns "Everyone" for the full list, else the plural labels joined with " and ".
 */
export function targetGendersToLabel(genders: readonly string[]): string {
  const unique = new Set(genders);
  if (unique.size > 1 && ALL_GENDERS.every((g) => unique.has(g))) {
    return "Everyone";
  }
  return GENDERS.filter((g) => unique.has(g.value) && g.plural !== null)
    .map((g) => g.plural)
    .join(" and ");
}

/**
 * The display label for one gender value.
 * @param value The wire value.
 * @returns The label ("Man"), or "" for an unknown value.
 */
export function genderLabel(value: string): string {
  return GENDERS.find((g) => g.value === value)?.label ?? "";
}
