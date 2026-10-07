/**
 * colors.ts
 * Color tokens from design.md 2.1. Screens and components use these names, never raw hex values.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */

/** Core color tokens (design.md 2.1). */
export const colors = {
  bg: "#FBF7F3",
  surface: "#FFFFFF",
  ink: "#221A1D",
  muted: "#7A6E70",
  line: "#EADFD6",
  accent: "#D9483B",
  accentSoft: "#FBE4DF",
  fav: "#E0A526",
  favSoft: "#FBF0D6",
  favInk: "#8A5E05",
  ok: "#3E8E68",
  chip: "#F3EAE2",
  scrim: "rgba(0,0,0,0.28)",
  dim: "rgba(0,0,0,0.4)",
  white: "#FFFFFF",
  photoGhost: "rgba(255,255,255,0.35)",
} as const;

/** Tint pairs for the Home menu tiles: background, then icon color. */
export const tileTints = {
  matches: { bg: colors.accentSoft, fg: colors.accent },
  search: { bg: "#E4ECFB", fg: "#4B5FC1" },
  chats: { bg: "#E1F1E9", fg: colors.ok },
  notes: { bg: colors.favSoft, fg: colors.favInk },
} as const;

/** Avatar placeholder gradients, top-left to bottom-right (design.md 2.1). */
export const avatarGradients: readonly (readonly [string, string])[] = [
  ["#8FB3D9", "#2F5E8C"],
  ["#9FD7C1", "#3E8E68"],
  ["#A9B9F2", "#4B5FC1"],
  ["#C9A7E8", "#7B4BB0"],
  ["#F2A9C8", "#C2477E"],
  ["#F6CF7E", "#D98E1F"],
];

/** The landing art's gradient (Nok). */
export const landingGradient = ["#F4A38C", "#D9483B"] as const;
