/**
 * avatar.ts
 * Picks a person's placeholder gradient from their userId, so they keep the same color everywhere
 * (design.md 2.1), and their initial.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */

/**
 * A stable index for a userId.
 * @param userId The user's ID.
 * @param count Number of gradients to choose from.
 * @param overrides Fixed indexes for some IDs (the sample people in mock mode).
 * @returns An index from 0 to count - 1.
 */
export function gradientIndex(
  userId: string,
  count: number,
  overrides: Readonly<Record<string, number>> = {},
): number {
  const fixed = overrides[userId];
  if (fixed !== undefined) {
    return fixed % count;
  }
  let hash = 0;
  for (const char of userId) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash % count;
}

/**
 * The initial shown on a placeholder.
 * @param displayName The display name.
 * @returns Its first character, upper case, or "?" when empty.
 */
export function initialOf(displayName: string): string {
  const first = Array.from(displayName.trim())[0];
  return first === undefined ? "?" : first.toLocaleUpperCase();
}
