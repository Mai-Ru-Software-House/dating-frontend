/**
 * typography.ts
 * Type scale from design.md 2.3. Each weight maps to its own Inter font family, because Android
 * ignores fontWeight on custom fonts.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { TextStyle } from "react-native";

/** Inter font family names, one per weight, as loaded in App.tsx. */
export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

/** Largest text scale used for text inside fixed-height controls (design.md 2.3). */
export const MAX_FONT_SCALE = 1.3;

/**
 * Builds a text style from a size, a font and an optional letter spacing.
 * @param fontSize Size in points.
 * @param fontFamily One of `fonts`.
 * @param lineHeight Line height in points.
 * @param letterSpacing Letter spacing in points (default 0).
 * @returns A text style.
 */
function textStyle(
  fontSize: number,
  fontFamily: string,
  lineHeight: number,
  letterSpacing = 0,
): TextStyle {
  return { fontSize, fontFamily, lineHeight, letterSpacing };
}

/** Text style tokens (design.md 2.3). */
export const type = {
  display: textStyle(52, fonts.bold, 56, -2),
  title: textStyle(30, fonts.bold, 36, -0.6),
  heading: textStyle(24, fonts.bold, 30, -0.4),
  profileName: textStyle(28, fonts.bold, 34, -0.4),
  cardName: textStyle(26, fonts.bold, 32),
  navTitle: textStyle(17, fonts.semibold, 22),
  button: textStyle(16, fonts.semibold, 20),
  rowTitle: textStyle(16, fonts.medium, 20),
  rowTitleUnread: textStyle(16, fonts.semibold, 20),
  body: textStyle(15, fonts.regular, 21),
  tileTitle: textStyle(15, fonts.semibold, 20),
  rowSub: textStyle(14, fonts.regular, 18),
  rowSubUnread: textStyle(14, fonts.medium, 18),
  label: textStyle(13, fonts.medium, 16),
  section: textStyle(12, fonts.semibold, 16, 0.8),
  caption: textStyle(12, fonts.regular, 16),
  captionMedium: textStyle(12, fonts.medium, 16),
  meta: textStyle(11, fonts.regular, 14),
  noteBody: textStyle(17, fonts.regular, 26),
} as const;
